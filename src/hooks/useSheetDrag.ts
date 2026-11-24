import { useEffect, useRef, type RefObject } from 'react'

interface Options {
  /** The element that follows the finger (the sheet / panel itself). */
  sheetRef: RefObject<HTMLElement | null>
  /** Re-run the effect when the element gets mounted (the components render `null` while closed). */
  mounted: boolean
  /** Dragging is only allowed while the sheet is open (not while it is closing). */
  active: boolean
  onClose: () => void
  /** Optional dimming backdrop that fades together with the drag. */
  backdropRef?: RefObject<HTMLElement | null>
  /** Backdrop opacity of the fully open sheet (must match the CSS). */
  backdropAlpha?: number
  /** Transform that is always part of the element's resting transform (e.g. `translateX(-50%)`). */
  baseTransform?: string
  /** Final transform when the sheet is dismissed by the drag. */
  exitTransform?: string
  /** Transition used for the dismiss slide / the snap back. */
  exitTransition?: string
  snapTransition?: string
  /** Called right before `onClose` when the drag dismissed the sheet. */
  onDismissStart?: () => void
}

const START_SLOP = 3 // px before a gesture turns into a drag
const MIN_DISTANCE = 110 // px (in sheet points) that always dismiss
const MIN_FRACTION = 0.3 // or this share of the sheet height
const MIN_VELOCITY = 0.5 // px/ms flick velocity
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * iOS-style "drag down to dismiss" for bottom sheets.
 * - Works with touch and with the mouse (desktop frame).
 * - Starts from anywhere on the sheet, but never when the touched content is a scroller that is
 *   scrolled down (then the gesture scrolls the content, like in iOS).
 * - Dismisses when dragged far enough or flicked, otherwise springs back.
 * - Opt out for a subtree with the `data-no-sheet-drag` attribute.
 */
export function useSheetDrag(options: Options) {
  const opts = useRef(options)
  opts.current = options

  useEffect(() => {
    const el = options.sheetRef.current
    if (!el || !options.mounted) return
    const o = () => opts.current

    type Kind = 'touch' | 'mouse'
    let state: 'idle' | 'pending' | 'drag' | 'ignore' = 'idle'
    let kind: Kind = 'touch'
    let startX = 0
    let startY = 0
    let dy = 0
    let scale = 1
    let height = 1
    let samples: Array<{ t: number; y: number }> = []
    let removeWindowListeners: (() => void) | null = null
    let snapTimer: number | undefined

    const canStart = (target: EventTarget | null) => {
      if (!o().active) return false
      let n = target as HTMLElement | null
      while (n && n !== el) {
        if (n.dataset && n.dataset.noSheetDrag !== undefined) return false
        if (kind === 'mouse' && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.isContentEditable)) return false
        if (n.scrollTop > 0 && n.scrollHeight > n.clientHeight + 1) {
          const oy = getComputedStyle(n).overflowY
          if (oy === 'auto' || oy === 'scroll') return false
        }
        n = n.parentElement
      }
      return true
    }

    const prefix = () => (o().baseTransform ? `${o().baseTransform} ` : '')

    const paint = (d: number) => {
      el.style.transition = 'none'
      el.style.transform = `${prefix()}translateY(${d}px)`
      const bd = o().backdropRef?.current
      if (bd) {
        const alpha = o().backdropAlpha ?? 0.28
        bd.style.transition = 'none'
        bd.style.background = `rgba(0, 0, 0, ${(alpha * (1 - Math.min(1, d / height))).toFixed(3)})`
      }
    }

    const clearBackdrop = () => {
      const bd = o().backdropRef?.current
      if (bd) {
        bd.style.transition = ''
        bd.style.background = ''
      }
    }

    const suppressNextClick = () => {
      const stop = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
      }
      window.addEventListener('click', stop, true)
      window.setTimeout(() => window.removeEventListener('click', stop, true), 120)
    }

    const velocity = () => {
      const last = samples[samples.length - 1]
      const first = samples.find((s) => last.t - s.t <= 100) ?? last
      const dt = last.t - first.t
      return dt > 0 ? (last.y - first.y) / dt / scale : 0
    }

    const finish = (cancelled: boolean) => {
      removeWindowListeners?.()
      removeWindowListeners = null
      document.body.style.userSelect = ''
      const wasDrag = state === 'drag'
      state = 'idle'
      if (!wasDrag) return
      if (dy > 6) suppressNextClick()
      const v = samples.length > 1 ? velocity() : 0
      const dismiss = !cancelled && (dy > Math.max(MIN_DISTANCE, height * MIN_FRACTION) || (v > MIN_VELOCITY && dy > 24))
      if (dismiss) {
        o().onDismissStart?.()
        el.style.transition = o().exitTransition ?? `transform 0.32s ${EASE}`
        el.style.transform = o().exitTransform ?? `${prefix()}translateY(100%)`
        clearBackdrop()
        o().onClose()
      } else {
        el.style.transition = o().snapTransition ?? `transform 0.3s ${EASE}`
        el.style.transform = ''
        clearBackdrop()
        window.clearTimeout(snapTimer)
        snapTimer = window.setTimeout(() => {
          el.style.transition = ''
        }, 340)
      }
    }

    const move = (x: number, y: number, e: Event) => {
      if (state === 'ignore' || state === 'idle') return
      const rawDy = y - startY
      if (state === 'pending') {
        const dx = x - startX
        if (Math.abs(rawDy) < START_SLOP && Math.abs(dx) < START_SLOP) return
        // Only a mostly-vertical downward movement starts the dismiss drag.
        if (rawDy <= 0 || Math.abs(dx) > rawDy) {
          state = 'ignore'
          return
        }
        state = 'drag'
        window.clearTimeout(snapTimer)
        const rect = el.getBoundingClientRect()
        scale = el.offsetHeight ? rect.height / el.offsetHeight || 1 : 1
        height = el.offsetHeight || 1
        samples = []
        if (kind === 'mouse') document.body.style.userSelect = 'none'
      }
      if (e.cancelable) e.preventDefault()
      e.stopPropagation() // keep the inner rubber-band scroller out of this gesture
      dy = Math.max(0, rawDy / scale)
      samples.push({ t: performance.now(), y })
      if (samples.length > 12) samples.shift()
      paint(dy)
    }

    const begin = (k: Kind, x: number, y: number, target: EventTarget | null) => {
      if (state === 'drag') return
      kind = k
      if (!canStart(target)) {
        state = 'ignore'
        return
      }
      state = 'pending'
      startX = x
      startY = y
      dy = 0
    }

    /* ---- touch ---- */
    const onTouchStart = (e: TouchEvent) => {
      removeWindowListeners?.()
      if (e.touches.length !== 1) {
        state = 'ignore'
        return
      }
      const t = e.touches[0]
      begin('touch', t.clientX, t.clientY, e.target)
      if (state !== 'pending') return
      const tm = (ev: TouchEvent) => {
        const tt = ev.touches[0]
        if (tt) move(tt.clientX, tt.clientY, ev)
      }
      const te = (ev: TouchEvent) => finish(ev.type === 'touchcancel')
      window.addEventListener('touchmove', tm, { capture: true, passive: false })
      window.addEventListener('touchend', te, true)
      window.addEventListener('touchcancel', te, true)
      removeWindowListeners = () => {
        window.removeEventListener('touchmove', tm, true)
        window.removeEventListener('touchend', te, true)
        window.removeEventListener('touchcancel', te, true)
      }
    }

    /* ---- mouse (desktop frame) ---- */
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      removeWindowListeners?.()
      begin('mouse', e.clientX, e.clientY, e.target)
      if (state !== 'pending') return
      const pm = (ev: PointerEvent) => move(ev.clientX, ev.clientY, ev)
      const pu = (ev: PointerEvent) => finish(ev.type === 'pointercancel')
      window.addEventListener('pointermove', pm, true)
      window.addEventListener('pointerup', pu, true)
      window.addEventListener('pointercancel', pu, true)
      removeWindowListeners = () => {
        window.removeEventListener('pointermove', pm, true)
        window.removeEventListener('pointerup', pu, true)
        window.removeEventListener('pointercancel', pu, true)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    el.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      el.removeEventListener('touchstart', onTouchStart, true)
      el.removeEventListener('pointerdown', onPointerDown, true)
      removeWindowListeners?.()
      window.clearTimeout(snapTimer)
      document.body.style.userSelect = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.mounted])
}
