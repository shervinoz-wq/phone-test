import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useTransitionMount } from '../hooks/useTransitionMount'

interface Props {
  open: boolean
  onClose: () => void
  /** Which top corner the popover grows from. */
  anchor: 'left' | 'right'
  children: ReactNode
  /** Frame-accurate morph out of the nav-bar button (separate measured frames for the left and the right menu). */
  morph?: boolean
  /** Viewport rect of the tapped button. */
  morphFrom?: DOMRect | null
}

/** Total length of the morph in ms (closing plays the same timeline backwards). */
const SPEED = 3 // playback speed multiplier
const MENU_MS = 520 / SPEED
const MENU_RIGHT = 18 // must match `.menu.right { right: 18px }`
const MENU_LEFT = 18 // must match `.menu.left { left: 18px }`
const MENU_W = 228 // must match `.menu { width: 228px }`

/**
 * Edges (l, t, r, b) of the shell in points on the 390x844 frame, measured per recording frame.
 * `s` = content scale (content is laid out at its final place and scaled about its top-centre),
 * `blur` px, `content` / `shell` opacity, `radius` pt. `at` is the time offset in 0..1.
 */
function menuFrames(W: number, o: { x: number; y: number; w: number; h: number }, fin: { l: number; t: number; r: number; b: number }) {
  const k = W / 390
  const cx = o.x + o.w / 2
  const cy = o.y + o.h / 2
  const g = 1.1
  const R = (x: number) => W - x * k // inset from the right edge -> x coordinate
  return [
    // 1. resting round button
    { at: 0, l: o.x, t: o.y, r: o.x + o.w, b: o.y + o.h, radius: o.h / 2, shell: 0, content: 0, blur: 8, s: 1.15 },
    // 2. pressed: the glass button turns whiter, icon fades
    { at: 0.07, l: cx - (o.w * g) / 2, t: cy - (o.h * g) / 2, r: cx + (o.w * g) / 2, b: cy + (o.h * g) / 2, radius: (o.h * g) / 2, shell: 0.6, content: 0, blur: 8, s: 1.15 },
    // 3. plain white rounded square, a little lower-left of the button
    { at: 0.14, l: 329 * k, t: 43, r: R(19), b: 85, radius: 14, shell: 1, content: 0, blur: 8, s: 1.15 },
    // 4. blurred oval dropped below the button, content ghost visible
    { at: 0.3, l: 221 * k, t: 96, r: R(20), b: 296, radius: 60, shell: 1, content: 0.6, blur: 6, s: 1.15 },
    // 5. growing, content ~9% too large and still blurred
    { at: 0.48, l: 161 * k, t: 77, r: R(22), b: 398, radius: 55, shell: 1, content: 0.9, blur: 3, s: 1.09 },
    // 6. overshoot: wider than final, top still lower
    { at: 0.64, l: 142 * k, t: 51, r: R(19), b: 407, radius: 40, shell: 1, content: 1, blur: 1.2, s: 1.06 },
    // 7. overshoot at the bottom, almost final
    { at: 0.8, l: 139 * k, t: 40, r: R(19), b: 411, radius: 34, shell: 1, content: 1, blur: 0, s: 1.02 },
    // 8. final
    { at: 1, l: fin.l, t: fin.t, r: fin.r, b: fin.b, radius: 28, shell: 1, content: 1, blur: 0, s: 1 },
  ]
}

/**
 * Frames of the left-hand "Edit" menu, measured from its own recording (7 frames).
 * Same conventions as menuFrames; the shape grows from the Edit pill towards the bottom-right.
 */
function editFrames(W: number, o: { x: number; y: number; w: number; h: number }, fin: { l: number; t: number; r: number; b: number }) {
  const k = W / 390
  const cx = o.x + o.w / 2
  const cy = o.y + o.h / 2
  const g = 1.08
  const glow = '0 8px 30px rgba(0,0,0,0.22)'
  const soft = '0 14px 40px rgba(0,0,0,0.2)'
  return [
    // 1. resting "Edit" pill
    { at: 0, l: o.x, t: o.y, r: o.x + o.w, b: o.y + o.h, radius: o.h / 2, shell: 0, content: 0, blur: 8, s: 1.25, shadow: glow },
    // 2. pressed: pill grows a little, "Edit" fades out under a white veil
    { at: 0.07, l: cx - (o.w * g) / 2, t: cy - (o.h * g) / 2, r: cx + (o.w * g) / 2, b: cy + (o.h * g) / 2, radius: (o.h * g) / 2, shell: 0.65, content: 0, blur: 8, s: 1.25, shadow: glow },
    // 3. plain white pill, slightly narrower than the button, with a wide soft glow
    { at: 0.15, l: 20 * k, t: 43, r: 71 * k, b: 80, radius: 18, shell: 1, content: 0, blur: 8, s: 1.25, shadow: glow },
    // 4. egg-shaped blob dropped below the button, no readable content yet
    { at: 0.3, l: 31 * k, t: 57, r: 95 * k, b: 120, radius: 32, shell: 1, content: 0.2, blur: 8, s: 1.25, shadow: glow },
    // 5. ellipse with blurred content ("Add Favorite" visible), content ~20% too large
    { at: 0.5, l: 23 * k, t: 77, r: 191 * k, b: 198, radius: 55, shell: 1, content: 0.7, blur: 6, s: 1.2, shadow: soft },
    // 6. nearly as wide as the final menu, bottom overshoots, content ~17% too large
    { at: 0.7, l: 20 * k, t: 56, r: 222 * k, b: 224, radius: 40, shell: 1, content: 0.9, blur: 3.5, s: 1.17, shadow: soft },
    // 7. final
    { at: 1, l: fin.l, t: fin.t, r: fin.r, b: fin.b, radius: 28, shell: 1, content: 1, blur: 0, s: 1, shadow: soft },
  ]
}

/** iOS 26 style context-menu popover (grows out of the nav bar button). */
export function Menu({ open, onClose, anchor, children, morph, morphFrom }: Props) {
  const useMorph = !!morph
  const { mounted, shown } = useTransitionMount(open, useMorph ? MENU_MS + 20 : 260)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const anims = useRef<Animation[]>([])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useLayoutEffect(() => {
    if (!useMorph || !morphFrom || !mounted || anims.current.length) return
    const root = rootRef.current
    const menu = menuRef.current
    const inner = innerRef.current
    if (!root || !menu || !inner) return
    const W = root.clientWidth
    const rr = root.getBoundingClientRect()
    const sc = rr.width / W || 1
    const fw = MENU_W
    const fh = inner.offsetHeight
    const fT = parseFloat(getComputedStyle(menu).top) || 0
    const isLeft = anchor === 'left'
    const fL = isLeft ? MENU_LEFT : W - MENU_RIGHT - fw
    const o = {
      x: (morphFrom.left - rr.left) / sc,
      y: (morphFrom.top - rr.top) / sc,
      w: morphFrom.width / sc,
      h: morphFrom.height / sc,
    }
    const fin = { l: fL, t: fT, r: fL + fw, b: fT + fh }
    const f: Array<ReturnType<typeof menuFrames>[number] & { shadow?: string }> = isLeft
      ? editFrames(W, o, fin)
      : menuFrames(W, o, fin)
    const opt = { duration: MENU_MS, fill: 'both' as const, easing: 'linear' }
    anims.current = [
      menu.animate(
        f.map((k) => ({
          offset: k.at,
          left: `${k.l}px`,
          top: `${k.t}px`,
          width: `${k.r - k.l}px`,
          height: `${k.b - k.t}px`,
          borderRadius: `${k.radius}px`,
          opacity: k.shell,
          ...(k.shadow ? { boxShadow: k.shadow } : {}),
        })),
        opt,
      ),
      inner.animate(
        f.map((k) => ({
          offset: k.at,
          // the content stays at its final place while the shell moves/clips around it
          transform: `translate(${fL - k.l}px, ${fT - k.t}px) scale(${k.s})`,
          opacity: k.content,
          filter: `blur(${k.blur}px)`,
        })),
        opt,
      ),
    ]
  }, [useMorph, morphFrom, mounted, anchor])

  // Forward when opening, the same timeline backwards when closing.
  useEffect(() => {
    if (!useMorph) return
    anims.current.forEach((a) => {
      a.updatePlaybackRate(open ? 1 : -1)
      a.play()
    })
  }, [open, useMorph, mounted])

  useEffect(() => {
    if (!mounted) anims.current = []
  }, [mounted])

  if (!mounted) return null
  return (
    <div ref={rootRef} className={`menu-root${shown ? ' is-open' : ''}`}>
      <div className="menu-backdrop" onClick={onClose} />
      <div ref={menuRef} className={`menu glass-menu ${anchor}${useMorph ? ' morph' : ''}`} role="menu">
        {useMorph ? (
          <div ref={innerRef} className="menu-morph-inner">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

interface ItemProps {
  icon?: ReactNode
  children: ReactNode
  onClick: () => void
  checked?: boolean
  destructive?: boolean
  /** keep the text aligned with items that have an icon */
  indent?: boolean
}

export function MenuItem({ icon, children, onClick, checked, destructive, indent }: ItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu-item${destructive ? ' destructive' : ''}${indent ? ' indent' : ''}`}
      onClick={onClick}
    >
      {checked !== undefined && <span className="menu-check">{checked ? '✓' : ''}</span>}
      {icon && <span className="menu-icon">{icon}</span>}
      <span className="menu-label">{children}</span>
    </button>
  )
}

export const MenuDivider = () => <div className="menu-divider" role="separator" />
