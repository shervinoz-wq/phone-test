import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useTransitionMount } from '../hooks/useTransitionMount'

export type MorphKind = 'center' | 'plus'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** Card-morph animation measured from iPhone recordings: 'center' = "Create New Contact" link, 'plus' = top-right + button. */
  morph?: MorphKind
  /** Viewport rect of the tapped button (needed for 'plus'). */
  morphFrom?: DOMRect | null
}

/**
 * Frame geometry measured from the iPhone screen recordings (iPhone 13, 390x844 points).
 * left/right/top/bottom are insets of the card in points; `at` is the time offset (0..1);
 * `dim` is the backdrop opacity relative to its final value; `content` is the content opacity.
 * The content is laid out at full width and scaled with the card width (top-center origin).
 * The closing animation is exactly this timeline played backwards.
 */
interface Frame {
  at: number
  left: number
  right: number
  top: number // -1 = final top of the sheet
  bottom: number
  radius: number
  opacity: number
  content: number
  dim: number
  glass?: boolean // grey translucent button look (before the sheet turns into a page)
  gScale?: number // "+" glyph scale
  gOpacity?: number
  gCx?: number // glyph centre, distance from the card's right edge
  gCy?: number // glyph centre, distance from the card's top edge
}

const SPEED = 3 // playback speed multiplier (1 = speed measured from the recordings guess)
const CENTER_MS = 480 / SPEED
const PLUS_MS = 560 / SPEED

const CENTER_FRAMES: Frame[] = [
  { at: 0.0, left: 77, right: 77, top: 333, bottom: 285, radius: 30, opacity: 0.55, content: 0.65, dim: 0.57 },
  { at: 0.16, left: 42, right: 42, top: 222, bottom: 165, radius: 33, opacity: 0.92, content: 0.95, dim: 0.83 },
  { at: 0.25, left: 32, right: 32, top: 192, bottom: 131, radius: 35, opacity: 1, content: 1, dim: 0.87 },
  { at: 0.51, left: 10, right: 10, top: 101, bottom: 43, radius: 37, opacity: 1, content: 1, dim: 0.96 },
  { at: 1.0, left: 0, right: 0, top: -1, bottom: 0, radius: 38, opacity: 1, content: 1, dim: 1 },
]

/** Frames of the "+" morph. f1/f2 depend on the real button rect (o = x,y,w,h in points inside the app frame). */
function plusFrames(W: number, H: number, o: { x: number; y: number; w: number; h: number }): Frame[] {
  const cx = o.x + o.w / 2
  const cy = o.y + o.h / 2
  const g = 1.3 // pressed button grows ~1.3x (frame 2)
  const w2 = o.w * g
  const h2 = o.h * g
  const k = W / 390
  return [
    // 1. resting button
    { at: 0, left: o.x, right: W - o.x - o.w, top: o.y, bottom: H - o.y - o.h, radius: o.h / 2, opacity: 1, content: 0, dim: 0, glass: true, gScale: 0.55, gOpacity: 1, gCx: o.w / 2, gCy: o.h / 2 },
    // 2. pressed: button grows, backdrop starts dimming
    { at: 0.08, left: cx - w2 / 2, right: W - cx - w2 / 2, top: cy - h2 / 2, bottom: H - cy - h2 / 2, radius: h2 / 2, opacity: 1, content: 0, dim: 0.15, glass: true, gScale: 0.72, gOpacity: 1, gCx: w2 / 2, gCy: h2 / 2 },
    // 3. grey glass rectangle hanging from the top-right corner, "+" enlarged, keyboard already rising
    { at: 0.18, left: 288 * k, right: 4 * k, top: 37, bottom: 660 * (H / 844), radius: 34, opacity: 1, content: 0, dim: 0.4, glass: true, gScale: 1, gOpacity: 1, gCx: 49, gCy: 51 },
    // 4. page appears (content scale .84), card overshoots slightly lower than its final top
    { at: 0.45, left: 61 * k, right: 4 * k, top: 60, bottom: 145 * (H / 844), radius: 38, opacity: 1, content: 1, dim: 0.9, gScale: 1.1, gOpacity: 0, gCx: 49, gCy: 51 },
    // 5. nearly final
    { at: 0.75, left: 5 * k, right: 5 * k, top: 45, bottom: 10, radius: 38, opacity: 1, content: 1, dim: 1, gScale: 1.1, gOpacity: 0, gCx: 49, gCy: 51 },
    // final
    { at: 1, left: 0, right: 0, top: -1, bottom: 0, radius: 38, opacity: 1, content: 1, dim: 1, gScale: 1.1, gOpacity: 0, gCx: 49, gCy: 51 },
  ]
}

/** Modal card that slides up from the bottom (iOS "page sheet"). */
export function Sheet({ open, onClose, children, className, morph, morphFrom }: SheetProps) {
  const ms = morph === 'plus' ? PLUS_MS : CENTER_MS
  const { mounted, shown } = useTransitionMount(open, morph ? ms + 20 : 380)
  const openedAt = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const glyphRef = useRef<HTMLDivElement>(null)
  const anims = useRef<Animation[]>([])
  useEffect(() => {
    if (open) openedAt.current = Date.now()
  }, [open])

  // Create the morph timeline once the sheet is in the DOM (before the first paint).
  useLayoutEffect(() => {
    if (!morph || !mounted || anims.current.length) return
    const root = rootRef.current
    const sheet = sheetRef.current
    const inner = innerRef.current
    const dim = dimRef.current
    if (!root || !sheet || !inner || !dim) return
    const W = root.clientWidth
    const H = root.clientHeight
    const topFinal = parseFloat(getComputedStyle(sheet).top) || 0
    const tint = getComputedStyle(sheet).backgroundColor

    let frames: Frame[]
    if (morph === 'plus' && morphFrom) {
      const rr = root.getBoundingClientRect()
      const sc = rr.width / W || 1
      frames = plusFrames(W, H, {
        x: (morphFrom.left - rr.left) / sc,
        y: (morphFrom.top - rr.top) / sc,
        w: morphFrom.width / sc,
        h: morphFrom.height / sc,
      })
    } else {
      frames = CENTER_FRAMES
    }
    const f = frames.map((k) => (k.top < 0 ? { ...k, top: topFinal } : k))
    const opt = { duration: ms, fill: 'both' as const, easing: 'linear' }
    const GLASS = 'rgb(224, 224, 228)'

    const list: Animation[] = []
    list.push(
      sheet.animate(
        f.map((k) => ({
          offset: k.at,
          left: `${k.left}px`,
          right: `${k.right}px`,
          top: `${k.top}px`,
          bottom: `${k.bottom}px`,
          borderRadius: `${k.radius}px ${k.radius}px 0 0`,
          opacity: k.opacity,
          ...(morph === 'plus' ? { backgroundColor: k.glass ? GLASS : tint } : {}),
        })),
        opt,
      ),
    )
    // Content is laid out at full width, scaled with the card width and centred in the card.
    list.push(
      inner.animate(
        f.map((k) => {
          const width = Math.max(W - k.left - k.right, 1)
          return {
            offset: k.at,
            transform: `translateX(-50%) scale(${Math.min(width / W, 1)})`,
            opacity: k.content,
          }
        }),
        opt,
      ),
    )
    list.push(dim.animate(f.map((k) => ({ offset: k.at, opacity: k.dim })), opt))
    const glyph = glyphRef.current
    if (glyph && morph === 'plus') {
      list.push(
        glyph.animate(
          f.map((k) => ({
            offset: k.at,
            right: `${(k.gCx ?? 0) - 19}px`,
            top: `${(k.gCy ?? 0) - 19}px`,
            transform: `scale(${k.gScale ?? 1})`,
            opacity: k.gOpacity ?? 0,
          })),
          opt,
        ),
      )
    }
    inner.style.width = `${W}px`
    inner.style.height = `${H - topFinal}px`
    anims.current = list
  }, [morph, morphFrom, mounted, ms])

  // Forward when opening, the same timeline backwards when closing.
  useEffect(() => {
    if (!morph) return
    anims.current.forEach((a) => {
      a.updatePlaybackRate(open ? 1 : -1)
      a.play()
    })
  }, [open, morph, mounted])

  // Drop the finished timeline once the sheet has been unmounted.
  useEffect(() => {
    if (!mounted) anims.current = []
  }, [mounted])

  if (!mounted) return null
  return (
    <div ref={rootRef} className={`sheet-root${morph ? ' morph' : ''}${shown ? ' is-open' : ''}`}>
      {/* Ignore the synthesized click that follows the touch which opened the sheet (e.g. the # of *#06#). */}
      <div
        ref={dimRef}
        className="sheet-backdrop"
        onClick={() => {
          if (Date.now() - openedAt.current > 600) onClose()
        }}
      />
      <div ref={sheetRef} className={`sheet${className ? ` ${className}` : ''}`} role="dialog" aria-modal="true">
        {morph ? (
          <div ref={innerRef} className="sheet-morph-inner">
            {children}
          </div>
        ) : (
          children
        )}
        {morph === 'plus' && <div ref={glyphRef} className="morph-plus" aria-hidden />}
      </div>
    </div>
  )
}

export interface SheetAction {
  label: string
  destructive?: boolean
  onClick: () => void
}

interface ActionSheetProps {
  open: boolean
  title?: string
  actions: SheetAction[]
  onClose: () => void
}

/** iOS action sheet: a group of actions and a separate Cancel button. */
export function ActionSheet({ open, title, actions, onClose }: ActionSheetProps) {
  const { mounted, shown } = useTransitionMount(open, 300)
  if (!mounted) return null
  return (
    <div className={`sheet-root action${shown ? ' is-open' : ''}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="action-sheet" role="dialog" aria-modal="true">
        <div className="action-group">
          {title && <div className="action-title">{title}</div>}
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`action-btn${a.destructive ? ' destructive' : ''}`}
              onClick={() => {
                onClose()
                a.onClick()
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="action-group">
          <button type="button" className="action-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
