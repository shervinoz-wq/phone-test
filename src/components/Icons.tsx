import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, p: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  'aria-hidden': true,
  focusable: false,
  ...p,
})

/* ---------- Tab bar (filled, like the reference) ---------- */

export const StarIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M12 2.4l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.4 6 20.7l1.4-6.7-5-4.6 6.7-.8z" strokeLinejoin="round" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

export const ClockIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6.8V12H7.6" fill="none" stroke="var(--tab-bg)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const PersonCircleIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <circle cx="12" cy="12" r="10" />
    <g fill="var(--tab-bg)">
      <circle cx="12" cy="9.3" r="3.5" />
      <path d="M4.8 18.5C6.3 15.8 8.9 14.5 12 14.5s5.7 1.3 7.2 4A10 10 0 0 1 12 22a10 10 0 0 1-7.2-3.5z" />
    </g>
  </svg>
)

export const KeypadIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.15" />))}
  </svg>
)

function gearPath(teeth = 8, ro = 10.6, ri = 8.2): string {
  const pitch = (Math.PI * 2) / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const c = i * pitch
    const seq: [number, number][] = [
      [ri, c - pitch * 0.34],
      [ro, c - pitch * 0.2],
      [ro, c + pitch * 0.2],
      [ri, c + pitch * 0.34],
    ]
    for (const [r, a] of seq) pts.push(`${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`)
  }
  const hole = 3.5
  return `M${pts.join('L')}Z M${12 + hole} 12a${hole} ${hole} 0 1 0 ${-hole * 2} 0a${hole} ${hole} 0 1 0 ${hole * 2} 0Z`
}
const GEAR = gearPath()

export const GearIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d={GEAR} fillRule="evenodd" />
  </svg>
)

/* ---------- Generic glyphs ---------- */

export const PhoneIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M3.91 3.44C3.67 3.62 3.63 3.71 3.53 3.85C3.43 3.99 3.41 4.13 3.31 4.26C3.21 4.39 3.02 4.49 2.93 4.64C2.84 4.78 2.81 4.89 2.74 5.12C2.68 5.36 2.59 5.74 2.56 6.06C2.52 6.38 2.51 6.73 2.52 7.03C2.52 7.34 2.54 7.67 2.59 7.90C2.64 8.13 2.75 8.19 2.82 8.42C2.89 8.65 2.82 8.81 3.01 9.28C3.19 9.75 3.74 10.82 3.94 11.23C4.15 11.64 4.14 11.60 4.24 11.76C4.35 11.91 4.47 12.00 4.58 12.17C4.69 12.34 4.74 12.57 4.88 12.77C5.02 12.97 5.24 13.15 5.40 13.37C5.57 13.59 5.70 13.89 5.85 14.08C6.00 14.27 6.16 14.33 6.30 14.49C6.45 14.65 6.50 14.81 6.72 15.05C6.93 15.30 7.45 15.78 7.62 15.95C7.78 16.13 7.62 16.03 7.69 16.10C7.76 16.17 7.83 16.17 8.03 16.37C8.23 16.56 8.67 17.07 8.89 17.27C9.11 17.46 9.11 17.34 9.34 17.53C9.57 17.71 10.05 18.21 10.28 18.39C10.50 18.57 10.51 18.48 10.69 18.61C10.87 18.75 11.16 19.05 11.36 19.18C11.56 19.31 11.69 19.27 11.89 19.40C12.09 19.53 12.09 19.70 12.56 19.96C13.04 20.23 14.11 20.74 14.74 20.98C15.36 21.21 15.82 21.31 16.31 21.39C16.80 21.47 17.27 21.48 17.66 21.46C18.05 21.44 18.37 21.37 18.67 21.28C18.97 21.18 19.19 21.06 19.46 20.90C19.73 20.74 20.08 20.48 20.28 20.30C20.49 20.13 20.56 20.03 20.69 19.85C20.83 19.67 20.99 19.43 21.11 19.21C21.23 19.00 21.35 18.74 21.41 18.54C21.46 18.34 21.48 18.18 21.44 18.01C21.41 17.85 21.33 17.71 21.22 17.57C21.11 17.42 20.94 17.27 20.77 17.12C20.60 16.97 20.37 16.78 20.21 16.67C20.04 16.55 19.99 16.58 19.79 16.44C19.60 16.30 19.23 15.93 19.05 15.80C18.86 15.67 18.83 15.76 18.67 15.65C18.51 15.55 18.28 15.31 18.07 15.17C17.86 15.02 17.58 14.87 17.43 14.79C17.28 14.72 17.33 14.73 17.17 14.72C17.02 14.70 16.73 14.67 16.50 14.72C16.26 14.77 16.03 14.87 15.75 15.02C15.46 15.17 15.07 15.46 14.77 15.62C14.47 15.77 14.22 15.90 13.95 15.95C13.68 16.00 13.45 16.00 13.16 15.92C12.87 15.83 12.80 15.91 12.22 15.47C11.65 15.02 10.35 13.90 9.71 13.26C9.08 12.61 8.67 11.94 8.40 11.57C8.13 11.20 8.18 11.22 8.10 11.04C8.02 10.87 7.95 10.68 7.92 10.52C7.88 10.36 7.90 10.23 7.92 10.11C7.93 9.99 7.83 10.14 8.03 9.81C8.22 9.47 8.87 8.46 9.08 8.08C9.28 7.71 9.23 7.73 9.26 7.56C9.30 7.38 9.35 7.27 9.30 7.03C9.26 6.80 9.21 6.55 9.00 6.17C8.79 5.79 8.45 5.32 8.03 4.75C7.60 4.17 6.80 3.10 6.45 2.72C6.10 2.35 6.09 2.53 5.93 2.50C5.77 2.47 5.65 2.49 5.48 2.54C5.31 2.58 5.18 2.61 4.92 2.76C4.65 2.91 4.14 3.26 3.91 3.44Z" />
  </svg>
)

export const BackspaceIcon = ({ size = 28, ...p }: P) => (
  <svg viewBox="0 0 28 22" {...base(size, p)} height={(size * 22) / 28}>
    <path
      d="M8.7 1.5H24a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H8.7a3 3 0 0 1-2.3-1.1L1.3 12.7a2.2 2.2 0 0 1 0-2.9l5.1-6.2a3 3 0 0 1 2.3-2.1z"
      fill="#007aff"
    />
    <path d="M13.6 7.6l7 6.8M20.6 7.6l-7 6.8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const SearchIcon = ({ size = 16, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...base(size, p)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </svg>
)

export const ChevronLeftIcon = ({ size = 22, ...p }: P) => (
  <svg viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)} width={(size * 12) / 22}>
    <path d="M10 2L2 11l8 9" />
  </svg>
)

export const PlusIcon = ({ size = 22, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...base(size, p)}>
    <path d="M12 4v16M4 12h16" />
  </svg>
)

export const InfoIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="none" {...base(size, p)}>
    <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="7.8" r="1.2" fill="currentColor" />
    <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const MinusCircleIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" {...base(size, p)}>
    <circle cx="12" cy="12" r="11" fill="#ff3b30" />
    <path d="M6.6 12h10.8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
)

export const MessageIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M12 3C6.5 3 2 6.6 2 11c0 2.3 1.2 4.4 3.2 5.8-.2 1.5-.9 2.8-1.9 3.9a.5.5 0 0 0 .5.8c2.3-.3 4.1-1.1 5.3-2 .9.2 1.9.3 2.9.3 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
  </svg>
)

export const VideoIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <rect x="1.5" y="5.5" width="14" height="13" rx="3.2" />
    <path d="M17.5 10.2l4.2-2.8a.6.6 0 0 1 .9.5v8.2a.6.6 0 0 1-.9.5l-4.2-2.8z" />
  </svg>
)

export const MailIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M4 4h16a2 2 0 0 1 2 2v.6l-10 6.2L2 6.6V6a2 2 0 0 1 2-2z" />
    <path d="M22 9.1V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.1l10 6.2z" />
  </svg>
)

export const MicOffIcon = ({ size = 30, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    <path d="M3.5 3.5l17 17" />
  </svg>
)

export const SpeakerIcon = ({ size = 30, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M3 9.5v5h3.6l4.9 4V5.5l-4.9 4z" />
    <path d="M14.5 8.5a4.8 4.8 0 0 1 0 7M17 6a8.2 8.2 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
)

export const PersonCropIcon = ({ size = 30, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <circle cx="12" cy="8" r="4.2" />
    <path d="M3.8 20.5c.6-4 3.7-6.2 8.2-6.2s7.6 2.2 8.2 6.2z" />
  </svg>
)

export const PersonPlusIcon = ({ size = 22, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <circle cx="9.5" cy="8" r="4" />
    <path d="M1.8 20c.5-3.7 3.5-5.7 7.7-5.7s7.2 2 7.7 5.7z" />
    <path d="M19 7v6M16 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const EndCallIcon = ({ size = 34, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)} style={{ transform: 'rotate(135deg)' }}>
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
  </svg>
)

export const SmallPhoneIcon = ({ size = 12, ...p }: P) => <PhoneIcon size={size} {...p} />

/* Status bar (only used inside the desktop phone frame) */
export const SignalIcon = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
    <rect x="0" y="8" width="3" height="4" rx="1" />
    <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
    <rect x="10" y="3" width="3" height="9" rx="1" />
    <rect x="15" y="0" width="3" height="12" rx="1" />
  </svg>
)
export const WifiIcon = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
    <path d="M8.5 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.5 10.5 0 0 0 8.5.5 10.5 10.5 0 0 0 1.4 3.4l1.1 1.2a8.8 8.8 0 0 1 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.1-1.2a7 7 0 0 0-9 0l1.1 1.2c.9-.8 2.1-1.3 3.4-1.3zM8.5 9.2c.6 0 1.1.2 1.5.6L8.5 11.5 7 9.8c.4-.4.9-.6 1.5-.6z" />
  </svg>
)
export const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
    <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" />
    <rect x="2" y="2" width="19" height="9" rx="2.2" fill="currentColor" />
    <path d="M24 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2z" fill="currentColor" opacity=".45" />
  </svg>
)

/* ---------- Outline glyphs used by the glass UI ---------- */
const stroke = (size: number, p: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  ...base(size, p),
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const SearchGlassIcon = ({ size = 24, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={2.3}>
    <circle cx="10.5" cy="10.5" r="6.6" />
    <path d="M15.6 15.6L21 21" />
  </svg>
)

export const CloseIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={2.3}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
)

export const CheckIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={2.4}>
    <path d="M4.5 12.8l5 5L19.5 6.5" />
  </svg>
)

export const FilterIcon = ({ size = 24, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={2.1}>
    <path d="M3.5 7h17M6.5 12h11M9.5 17h5" />
  </svg>
)

export const PersonCircleOutlineIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="9.8" r="3" fill="currentColor" stroke="none" />
    <path d="M6.2 17.8c1.4-2 3.4-2.9 5.8-2.9s4.4.9 5.8 2.9" />
  </svg>
)

export const StarOutlineIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.8 6.4 20l1.3-6.2L3 9.5l6.3-.7z" />
  </svg>
)

export const CheckCircleOutlineIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M7.8 12.3l3 3 5.4-6" />
  </svg>
)

export const PhoneOutlineIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1z" />
  </svg>
)

export const MissedIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <path d="M12.5 3.5H8A4.5 4.5 0 0 0 3.5 8v8A4.5 4.5 0 0 0 8 20.5h8a4.5 4.5 0 0 0 4.5-4.5v-4.5" />
    <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none" />
  </svg>
)

export const VoicemailIcon = ({ size = 22, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={1.6}>
    <circle cx="6.5" cy="12" r="3.5" />
    <circle cx="17.5" cy="12" r="3.5" />
    <path d="M6.5 15.5h11" />
  </svg>
)

export const ChevronRightIcon = ({ size = 14, ...p }: P) => (
  <svg {...stroke(size, p)} strokeWidth={2.4}>
    <path d="M9 4l8 8-8 8" />
  </svg>
)

export const PlusCircleGreenIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" {...base(size, p)}>
    <circle cx="12" cy="12" r="12" fill="#34c759" />
    <path d="M12 6.5v11M6.5 12h11" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

export const BackspaceOutlineIcon = ({ size = 30, ...p }: P) => (
  <svg viewBox="0 0 28 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)} height={(size * 22) / 28}>
    <path d="M9 2h14a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H9a3 3 0 0 1-2.3-1.1L1.5 12.8a2.2 2.2 0 0 1 0-2.8L6.7 3.1A3 3 0 0 1 9 2z" />
    <path d="M13.5 7.5l7 7M20.5 7.5l-7 7" />
  </svg>
)

/** Person silhouette used on the blue "My Card" / new contact avatar. */
export const SilhouetteIcon = ({ size = 56, ...p }: P) => (
  <svg viewBox="0 0 100 100" {...base(size, p)}>
    <defs>
      <clipPath id="sil-clip">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
    </defs>
    <g clipPath="url(#sil-clip)" fill="#fff">
      <circle cx="50" cy="36" r="18" />
      <ellipse cx="50" cy="88" rx="30" ry="22" />
    </g>
  </svg>
)

/** Layout thumbnails for the Calls filter menu. */
/** Layout previews for the Calls filter menu; the selected one is drawn in blue, the other in grey. */
export const ClassicLayoutIcon = ({ active = false }: { active?: boolean }) => {
  const c = active ? '#0088ff' : '#8e8e93'
  return (
    <svg width="40" height="80" viewBox="0 0 40 80" aria-hidden>
      <rect x="1.5" y="1.5" width="37" height="77" rx="7" fill={active ? '#f2f8ff' : '#f3f3f5'} stroke={c} strokeWidth={active ? 2.4 : 2} />
      <rect x="14" y="4" width="12" height="3.5" rx="1.8" fill={c} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x="6" y={12 + i * 7.5} width="28" height="5.5" rx="1.5" fill={active ? '#b9d8fb' : '#dcdce0'} />
      ))}
      <rect x="5" y="69" width="30" height="5" rx="2.5" fill={c} />
    </svg>
  )
}

export const UnifiedLayoutIcon = ({ active = true }: { active?: boolean }) => {
  const c = active ? '#0088ff' : '#8e8e93'
  return (
    <svg width="40" height="80" viewBox="0 0 40 80" aria-hidden>
      <rect x="1.5" y="1.5" width="37" height="77" rx="7" fill={active ? '#f2f8ff' : '#f3f3f5'} stroke={c} strokeWidth={active ? 2.4 : 2} />
      <rect x="14" y="4" width="12" height="3.5" rx="1.8" fill={c} />
      {[0, 1, 2, 3].flatMap((r) =>
        [0, 1, 2].map((col) => (
          <rect key={`${r}${col}`} x={6 + col * 10} y={14 + r * 10} width="7.5" height="7" rx="1.5" fill={active ? '#b9d8fb' : '#dcdce0'} />
        )),
      )}
      <rect x="5" y="66" width="24" height="7" rx="3.5" fill={c} />
      <circle cx="33" cy="69.5" r="3.5" fill={c} />
    </svg>
  )
}

/** Light-grey filled delete key with a bold X (iOS 26 keypad). */
export const BackspaceFilledIcon = ({ size = 31, ...p }: P) => (
  <svg viewBox="0 0 31 23" {...base(size, p)} height={(size * 23) / 31}>
    <path
      d="M10.6 1h15.4a4.2 4.2 0 0 1 4.2 4.2v12.6A4.2 4.2 0 0 1 26 22H10.6a4.2 4.2 0 0 1-3.2-1.5L1.3 13.2a2.6 2.6 0 0 1 0-3.4l6.1-7.3A4.2 4.2 0 0 1 10.6 1z"
      fill="#dcdcdf"
    />
    <path d="M14.3 7.6l8.2 7.8M22.5 7.6l-8.2 7.8" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

/** person.crop.circle.badge.plus (top-right of the keypad). */
export const AddContactIcon = ({ size = 26, ...p }: P) => (
  <svg viewBox="0 0 28 28" fill="none" {...base(size, p)}>
    <defs>
      <clipPath id="ac-clip">
        <circle cx="16" cy="12" r="9.6" />
      </clipPath>
    </defs>
    <circle cx="16" cy="12" r="10.4" stroke="currentColor" strokeWidth="1.9" />
    <g clipPath="url(#ac-clip)" fill="currentColor">
      <circle cx="16" cy="9.4" r="3.7" />
      <ellipse cx="16" cy="20.6" rx="7.6" ry="5.6" />
    </g>
    <circle cx="6.6" cy="20.6" r="5.5" fill="#fff" stroke="currentColor" strokeWidth="1.9" />
    <path d="M6.6 17.9v5.4M3.9 20.6h5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/** person.crop.circle.fill (contact suggestion row). */
export const PersonFillCircleIcon = ({ size = 18, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <circle cx="12" cy="12" r="11" />
    <g fill="#fff">
      <circle cx="12" cy="9.4" r="3.9" />
      <path d="M4.6 18.6C6 15.9 8.7 14.6 12 14.6s6 1.3 7.4 4A11 11 0 0 1 12 23a11 11 0 0 1-7.4-4.4z" />
    </g>
  </svg>
)

export const ChevronDownIcon = ({ size = 14, ...p }: P) => (
  <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...base(size, p)} width={(size * 22) / 12}>
    <path d="M2 2l9 8 9-8" />
  </svg>
)

export const PeopleIcon = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 28 20" fill="currentColor" {...base(size, p)} width={(size * 28) / 20}>
    <circle cx="9" cy="5.6" r="4.2" />
    <path d="M0.8 18.6c.4-4.4 3.5-6.6 8.2-6.6s7.8 2.2 8.2 6.6z" />
    <circle cx="20" cy="6.4" r="3.4" />
    <path d="M18.6 12.4c.5-.1 1-.1 1.5-.1 4 0 6.6 1.9 7 6.3h-7.8c-.1-2.6-.4-4.7-.7-6.2z" />
  </svg>
)

export const CalendarIcon = ({ size = 16, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base(size, p)}>
    <path d="M5.4 3.6h13.2a2.6 2.6 0 0 1 2.6 2.6V9H2.8V6.2a2.6 2.6 0 0 1 2.6-2.6z" />
    <path d="M2.8 10.2h18.4v7.6a2.6 2.6 0 0 1-2.6 2.6H5.4a2.6 2.6 0 0 1-2.6-2.6z" />
    <g fill="#6c78b8">
      <rect x="5.6" y="12" width="2.2" height="2" rx=".4" />
      <rect x="9" y="12" width="2.2" height="2" rx=".4" />
      <rect x="12.4" y="12" width="2.2" height="2" rx=".4" />
      <rect x="15.8" y="12" width="2.2" height="2" rx=".4" />
      <rect x="5.6" y="15.6" width="2.2" height="2" rx=".4" />
      <rect x="9" y="15.6" width="2.2" height="2" rx=".4" />
      <rect x="12.4" y="15.6" width="2.2" height="2" rx=".4" />
    </g>
  </svg>
)
