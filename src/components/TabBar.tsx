import { useEffect, useLayoutEffect, useRef, type ComponentType } from 'react'
import type { TabId } from '../types'
import { ClockIcon, KeypadIcon, PersonCircleIcon, SearchGlassIcon } from './Icons'

const TABS: { id: TabId; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'calls', label: 'Calls', Icon: ClockIcon },
  { id: 'contacts', label: 'Contacts', Icon: PersonCircleIcon },
  { id: 'keypad', label: 'Keypad', Icon: KeypadIcon },
]

const PAD = 4 // padding of the glass bar (px)

/**
 * Lens animation measured frame-by-frame from the iOS 26 tab bar
 * (Keypad -> Contacts, 7 captured frames):
 *  - the grey selection pill turns into a clear glass "lens" that jumps ahead fast
 *    (~72 % of the distance in the first frame, ~94 % by the third)
 *  - while travelling it stretches to ~1.34x its width, grows a bit taller than the bar,
 *    magnifies what is under it (icon + label in blue, with colour fringes on the edges)
 *  - then it shrinks back, goes ~7 % NARROWER than normal and settles at 1x,
 *    while the glass turns back into the flat grey pill.
 * p = progress of the lens centre (0 -> 1), w/h = pill scale, mag = magnification,
 * glass = 0 (flat grey pill) .. 1 (clear lens).
 */
const T = [0, 60, 120, 180, 250, 320, 400, 520]
const TRACKS = {
  p: [0, 0.72, 0.89, 0.935, 0.96, 0.985, 1, 1],
  w: [1, 1.3, 1.34, 1.21, 1.12, 1.04, 0.93, 1],
  h: [1, 1.14, 1.12, 1.08, 1.02, 1, 0.98, 1],
  mag: [1, 1.18, 1.2, 1.12, 1.04, 1, 1, 1],
  glass: [0, 1, 1, 0.8, 0.4, 0.1, 0, 0],
}
const DURATION = T[T.length - 1]

/** Cubic Hermite through the keyframes with Catmull-Rom tangents (smooth, no stop at each frame). */
function sample(values: number[], t: number): number {
  if (t <= 0) return values[0]
  if (t >= DURATION) return values[values.length - 1]
  let i = 0
  while (t > T[i + 1]) i++
  const slope = (k: number) => {
    const a = Math.max(0, k - 1)
    const b = Math.min(T.length - 1, k + 1)
    return (values[b] - values[a]) / (T[b] - T[a])
  }
  const dt = T[i + 1] - T[i]
  const s = (t - T[i]) / dt
  const s2 = s * s
  const s3 = s2 * s
  return (
    (2 * s3 - 3 * s2 + 1) * values[i] +
    (s3 - 2 * s2 + s) * dt * slope(i) +
    (-2 * s3 + 3 * s2) * values[i + 1] +
    (s3 - s2) * dt * slope(i + 1)
  )
}

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
  onSearch: () => void
  missedBadge: number
  hidden?: boolean
}

function TabVisual({ index, badge }: { index: number; badge: number }) {
  const { id, label, Icon } = TABS[index]
  return (
    <>
      <span className="tab-icon">
        <Icon size={23} />
        {id === 'calls' && badge > 0 && <span className="badge">{badge}</span>}
      </span>
      <span className="tab-label">{label}</span>
    </>
  )
}

/** iOS 26 floating tab bar: a glass pill with 3 tabs + a separate search button. */
export function TabBar({ active, onChange, onSearch, missedBadge, hidden }: Props) {
  const nav = useRef<HTMLElement>(null)
  const lens = useRef<HTMLDivElement>(null)
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const geo = useRef({ w: 0, h: 0 })
  const center = useRef<number | null>(null) // current lens centre (px, in the bar's coordinates)
  const raf = useRef(0)
  const index = TABS.findIndex((t) => t.id === active)

  const tabCenter = (i: number) => PAD + ((geo.current.w - PAD * 2) / 3) * (i + 0.5)

  const render = (cx: number, w = 1, h = 1, mag = 1, glass = 0) => {
    const l = lens.current
    if (!l) return
    const { w: bw, h: bh } = geo.current
    const tabW = (bw - PAD * 2) / 3
    const baseH = bh - PAD * 2
    const W = tabW * w
    const H = baseH * h
    const L = cx - W / 2
    const Tp = (bh - H) / 2
    l.style.left = `${L}px`
    l.style.top = `${Tp}px`
    l.style.width = `${W}px`
    l.style.height = `${H}px`
    l.style.borderRadius = `${H / 2}px`
    l.style.setProperty('--glass', glass.toFixed(3))

    // edges of the lens in the coordinates of the (un-moved) tab content
    const left = L - PAD
    const right = L + W - PAD
    const top = Tp - PAD
    const bottom = Tp + H - PAD
    const mx = cx - PAD
    const my = baseH / 2
    // refraction at the rim: the content just inside each edge is stretched
    // ~3.4x towards that edge, which smears the icon / label into streaks
    const K = 1 + 2.4 * glass
    const set = (el: HTMLDivElement | null, ox: number, oy: number, sx: number, sy: number) => {
      if (!el) return
      el.style.left = `${PAD - L}px`
      el.style.top = `${PAD - Tp}px`
      el.style.width = `${bw - PAD * 2}px`
      el.style.height = `${baseH}px`
      el.style.transformOrigin = `${ox}px ${oy}px`
      el.style.transform = `scale(${sx}, ${sy})`
    }
    const [base, t, b, lf, rt] = layers.current
    set(base, mx, my, mag, mag)
    set(t, mx, top + 14, mag, mag * K)
    set(b, mx, bottom - 14, mag, mag * K)
    set(lf, left + 16, my, mag * K, mag)
    set(rt, right - 16, my, mag * K, mag)
  }

  // measure + place the lens without animation
  useLayoutEffect(() => {
    const el = nav.current
    if (!el) return
    const measure = () => {
      geo.current = { w: el.clientWidth, h: el.clientHeight }
      if (!raf.current) {
        center.current = tabCenter(index)
        render(center.current)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // animate when the selected tab changes
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const to = tabCenter(index)
    const from = center.current ?? to
    cancelAnimationFrame(raf.current)
    if (from === to || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      raf.current = 0
      center.current = to
      render(to)
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(now - start, DURATION)
      const cx = from + (to - from) * sample(TRACKS.p, t)
      center.current = cx
      render(
        cx,
        sample(TRACKS.w, t),
        sample(TRACKS.h, t),
        sample(TRACKS.mag, t),
        Math.max(0, Math.min(1, sample(TRACKS.glass, t))),
      )
      if (t < DURATION) {
        raf.current = requestAnimationFrame(step)
      } else {
        raf.current = 0
        center.current = to
        render(to)
      }
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div className={`tabbar-wrap${hidden ? ' hidden' : ''}`}>
      <nav className="tabbar glass" aria-label="Main" ref={nav}>
        <div className="tab-row">
          {TABS.map(({ id }, i) => (
            <button
              key={id}
              type="button"
              className="tab"
              aria-current={active === id ? 'page' : undefined}
              onClick={() => onChange(id)}
            >
              <TabVisual index={i} badge={missedBadge} />
            </button>
          ))}
        </div>

        {/* glass lens: shows a blue, magnified copy of the tabs only inside itself,
            plus four rim layers that stretch the content near each edge (refraction) */}
        <div className="lens" ref={lens} aria-hidden>
          <div className="lens-fill" />
          {['base', 'top', 'bottom', 'left', 'right'].map((kind, k) => (
            <div key={kind} className={`lens-layer ${kind}`}>
              <div className="lens-content" ref={(el: HTMLDivElement | null) => void (layers.current[k] = el)}>
                {TABS.map(({ id }, i) => (
                  <div key={id} className="tab lens-tab">
                    <TabVisual index={i} badge={missedBadge} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="lens-rim" />
        </div>
      </nav>
      <button type="button" className="search-btn glass" aria-label="Search" onClick={onSearch}>
        <SearchGlassIcon size={26} />
      </button>
    </div>
  )
}
