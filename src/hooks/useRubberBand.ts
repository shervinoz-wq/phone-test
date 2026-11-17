import { useEffect, useRef } from 'react'

/** iOS rubber-band curve: the further you pull, the more it resists. */
const rubber = (x: number, dim: number) => (1 - 1 / ((x * 0.55) / dim + 1)) * dim

/**
 * iOS-style scrolling for a scroll container: in bounds it scrolls natively; when
 * you reach the top/bottom you can keep dragging a bit further (with resistance)
 * and on release the content springs quickly back to its limit.
 * Works for touch, mouse-drag and wheel / trackpad.
 */
export function useRubberBand() {
  const scroller = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    const box = inner.current
    if (!el || !box) return

    let raw = 0 // signed overscroll in px (+ = pulled down at top, - = pushed up at bottom)
    let edge: 'top' | 'bottom' | null = null
    let releaseTimer: number | undefined

    const maxScroll = () => Math.max(0, el.scrollHeight - el.clientHeight)
    const atTop = () => el.scrollTop <= 0
    const atBottom = () => el.scrollTop >= maxScroll() - 0.5
    const dim = () => el.clientHeight || 600

    const apply = (animate: boolean) => {
      const off = Math.sign(raw) * rubber(Math.abs(raw), dim())
      box.style.transition = animate ? 'transform 0.42s cubic-bezier(0.2, 0.85, 0.25, 1)' : 'none'
      box.style.transform = off ? `translate3d(0, ${off}px, 0)` : ''
    }
    const release = () => {
      window.clearTimeout(releaseTimer)
      raw = 0
      edge = null
      apply(true)
    }
    /** Adds a finger/wheel movement `d` (down = positive). Returns true if it was consumed as overscroll. */
    const push = (d: number): boolean => {
      if (raw === 0) {
        if (d > 0 && atTop()) edge = 'top'
        else if (d < 0 && atBottom()) edge = 'bottom'
        else return false
      }
      raw += d
      if (edge === 'top') raw = Math.max(0, raw)
      if (edge === 'bottom') raw = Math.min(0, raw)
      if (raw === 0) edge = null
      apply(false)
      return true
    }

    /* ---- touch ---- */
    let lastY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY
      window.clearTimeout(releaseTimer)
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      const d = y - lastY
      lastY = y
      if (push(d) && e.cancelable) e.preventDefault()
    }
    const onTouchEnd = () => {
      if (raw !== 0) release()
    }

    /* ---- wheel / trackpad ---- */
    const onWheel = (e: WheelEvent) => {
      if (push(-e.deltaY * 0.6)) {
        e.preventDefault()
        window.clearTimeout(releaseTimer)
        releaseTimer = window.setTimeout(release, 110)
      }
    }

    /* ---- mouse drag (desktop frame) ---- */
    let dragging = false
    let moved = false
    let startY = 0
    let startScroll = 0
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = false
      startY = e.clientY
      startScroll = el.scrollTop
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dy = e.clientY - startY
      if (!moved && Math.abs(dy) < 4) return
      if (!moved) {
        moved = true
        el.setPointerCapture(e.pointerId)
      }
      const target = startScroll - dy
      const max = maxScroll()
      el.scrollTop = Math.min(max, Math.max(0, target))
      raw = target < 0 ? -target : target > max ? -(target - max) : 0
      edge = raw > 0 ? 'top' : raw < 0 ? 'bottom' : null
      apply(false)
    }
    const onPointerUp = () => {
      dragging = false
      if (raw !== 0) release()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.clearTimeout(releaseTimer)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return { scroller, inner }
}
