import type { ReactNode } from 'react'

interface IconProps {
  size?: number
  className?: string
}

function Svg({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.4l2.95 6.1 6.65.9-4.85 4.65 1.2 6.65L12 17.5l-5.95 3.2 1.2-6.65L2.4 9.4l6.65-.9z" />
  </Svg>
)

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-.9 4.5h1.8v4.7l3.6 2.1-.9 1.5-4.5-2.7z" />
  </Svg>
)

export const PersonCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4.5a3 3 0 110 6 3 3 0 010-6zM6.3 17.8c1.1-2 3.3-3.1 5.7-3.1s4.6 1.1 5.7 3.1c-1.5 1.6-3.5 2.6-5.7 2.6s-4.2-1-5.7-2.6z"
    />
  </Svg>
)

export const KeypadIcon = (p: IconProps) => (
  <Svg {...p}>
    {[5.5, 12, 18.5].flatMap((cx) =>
      [5.5, 12, 18.5].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.9} />),
    )}
  </Svg>
)

export const GearIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </Svg>
)

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </Svg>
)

export const BackspaceIcon = ({ size = 28, className }: IconProps) => (
  <svg className={className} width={size} height={size * 0.75} viewBox="0 0 32 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M10.2 1.5h16.3A4.5 4.5 0 0131 6v12a4.5 4.5 0 01-4.5 4.5H10.2a4 4 0 01-3-1.35L1.4 14.4a3.4 3.4 0 010-4.4l5.8-7.15a4 4 0 013-1.35z"
    />
    <path d="M14 8.5l8 7M22 8.5l-8 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  </svg>
)

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.2} d="M12 4.5v15M4.5 12h15" />
  </Svg>
)

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle {...stroke} cx="10.5" cy="10.5" r="6.5" />
    <path {...stroke} d="M15.5 15.5L20.5 20.5" />
  </Svg>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.6} d="M15 4.5L7.5 12l7.5 7.5" />
  </Svg>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.6} d="M9 4.5L16.5 12 9 19.5" />
  </Svg>
)

export const MessageIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3C6.5 3 2.5 6.6 2.5 11c0 2.3 1.1 4.3 2.9 5.7-.2 1.2-.8 2.4-1.9 3.4-.2.2 0 .6.3.6 2 0 3.7-.8 4.9-1.7 1.1.3 2.2.5 3.3.5 5.5 0 9.5-3.6 9.5-8S17.5 3 12 3z" />
  </Svg>
)

export const VideoIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="6" width="13.5" height="12" rx="3" />
    <path d="M17 10.2l4.2-2.5c.5-.3 1.1 0 1.1.6v7.4c0 .6-.6.9-1.1.6L17 13.8z" />
  </Svg>
)

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M3.5 7.5l8.5 6 8.5-6" fill="none" stroke="var(--icon-cutout, #fff)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle {...stroke} strokeWidth={1.8} cx="12" cy="12" r="9.2" />
    <path {...stroke} strokeWidth={2.2} d="M12 11v5.5" />
    <circle cx="12" cy="7.8" r="1.2" />
  </Svg>
)

export const MicIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path {...stroke} d="M5 11.5a7 7 0 0014 0M12 18.5v3" />
  </Svg>
)

export const SpeakerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9.5v5h3.8L12 19V5L6.8 9.5z" />
    <path {...stroke} d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" />
  </Svg>
)

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.6} d="M4.5 12.5l5 5 10-11" />
  </Svg>
)
