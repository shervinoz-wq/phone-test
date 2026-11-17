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
    <path d="M12 6.8V12h4.4" fill="none" stroke="var(--tab-bg)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
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
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
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
export const ClassicLayoutIcon = () => (
  <svg width="40" height="80" viewBox="0 0 40 80" aria-hidden>
    <rect x="1.5" y="1.5" width="37" height="77" rx="7" fill="#f3f3f5" stroke="#8e8e93" strokeWidth="2" />
    <rect x="14" y="4" width="12" height="3.5" rx="1.8" fill="#8e8e93" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x="6" y={12 + i * 7.5} width="28" height="5.5" rx="1.5" fill="#dcdce0" />
    ))}
    <rect x="5" y="69" width="30" height="5" rx="2.5" fill="#8e8e93" />
  </svg>
)

export const UnifiedLayoutIcon = () => (
  <svg width="40" height="80" viewBox="0 0 40 80" aria-hidden>
    <rect x="1.5" y="1.5" width="37" height="77" rx="7" fill="#f2f8ff" stroke="#0088ff" strokeWidth="2.4" />
    <rect x="14" y="4" width="12" height="3.5" rx="1.8" fill="#0088ff" />
    {[0, 1, 2, 3].flatMap((r) =>
      [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={6 + c * 10} y={14 + r * 10} width="7.5" height="7" rx="1.5" fill="#b9d8fb" />
      )),
    )}
    <rect x="5" y="66" width="24" height="7" rx="3.5" fill="#0088ff" />
    <circle cx="33" cy="69.5" r="3.5" fill="#0088ff" />
  </svg>
)

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
