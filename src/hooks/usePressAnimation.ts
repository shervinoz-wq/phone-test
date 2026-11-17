import { useCallback, useEffect, useRef } from 'react'

/**
 * Press animation measured frame-by-frame from the iOS 26 Phone keypad
 * (screen recording of an iPhone):
 *  1. on touch the label turns light grey and the button grows ~13 %
 *  2. the label colour fades back to black while the button shrinks
 *  3. it dips ~4 % BELOW its normal size
 *  4. it settles at normal size, colours back to normal
 *
 * While the finger stays down the button holds at the peak (step 1);
 * on release the rest of the animation plays.
 */
export type PressKind = 'key' | 'call'

const DURATION = 560
const PEAK = 0.3

const KEY_BTN: Keyframe[] = [
  { offset: 0, transform: 'scale(1)', color: 'rgb(0,0,0)', easing: 'ease-out' },
  { offset: 0.07, transform: 'scale(1.04)', color: 'rgb(108,108,110)', easing: 'ease-out' },
  { offset: 0.18, transform: 'scale(1.1)', color: 'rgb(98,98,100)', easing: 'ease-out' },
  { offset: PEAK, transform: 'scale(1.135)', color: 'rgb(78,78,80)' },
  { offset: 0.4, transform: 'scale(1.13)', color: 'rgb(62,62,64)', easing: 'ease-in' },
  { offset: 0.55, transform: 'scale(1.07)', color: 'rgb(46,46,48)' },
  { offset: 0.7, transform: 'scale(1)', color: 'rgb(30,30,32)' },
  { offset: 0.82, transform: 'scale(0.965)', color: 'rgb(16,16,17)', easing: 'ease-out' },
  { offset: 0.92, transform: 'scale(0.985)', color: 'rgb(6,6,6)', easing: 'ease-out' },
  { offset: 1, transform: 'scale(1)', color: 'rgb(0,0,0)' },
]

/** White "glow" laid over the glass key (frames show a flat white face at the peak). */
const KEY_FILL: Keyframe[] = [
  { offset: 0, opacity: 0 },
  { offset: 0.07, opacity: 0.9 },
  { offset: 0.4, opacity: 1 },
  { offset: 0.7, opacity: 0.45 },
  { offset: 1, opacity: 0 },
]

const CALL_BTN: Keyframe[] = [
  { offset: 0, transform: 'scale(1)', backgroundColor: 'rgb(47,191,78)', easing: 'ease-out' },
  { offset: 0.12, transform: 'scale(1.085)', backgroundColor: 'rgb(23,254,76)', easing: 'ease-out' },
  { offset: PEAK, transform: 'scale(1.135)', backgroundColor: 'rgb(17,255,77)' },
  { offset: 0.5, transform: 'scale(1.11)', backgroundColor: 'rgb(22,255,76)', easing: 'ease-in' },
  { offset: 0.8, transform: 'scale(0.965)', backgroundColor: 'rgb(39,220,78)', easing: 'ease-out' },
  { offset: 0.9, transform: 'scale(0.975)', backgroundColor: 'rgb(39,213,78)', easing: 'ease-out' },
  { offset: 1, transform: 'scale(1)', backgroundColor: 'rgb(47,191,78)' },
]

export function usePressAnimation<T extends HTMLElement>(kind: PressKind, enabled = true) {
  const btn = useRef<T>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const anims = useRef<Animation[]>([])
  const held = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  const cancel = () => {
    window.clearTimeout(timer.current)
    anims.current.forEach((a) => a.cancel())
    anims.current = []
  }

  const down = useCallback(() => {
    if (!enabled) return
    const el = btn.current
    if (!el || typeof el.animate !== 'function') return
    cancel()
    held.current = true
    const opts: KeyframeAnimationOptions = { duration: DURATION, easing: 'linear', fill: 'none' }
    const list = [el.animate(kind === 'key' ? KEY_BTN : CALL_BTN, opts)]
    if (kind === 'key' && fill.current) list.push(fill.current.animate(KEY_FILL, opts))
    anims.current = list
    timer.current = window.setTimeout(() => {
      if (!held.current) return
      list.forEach((a) => {
        a.currentTime = DURATION * PEAK
        a.pause()
      })
    }, DURATION * PEAK)
  }, [kind, enabled])

  const up = useCallback(() => {
    held.current = false
    window.clearTimeout(timer.current)
    anims.current.forEach((a) => {
      if (a.playState === 'paused') a.play()
    })
  }, [])

  useEffect(() => cancel, [])

  return { btn, fill, down, up }
}
