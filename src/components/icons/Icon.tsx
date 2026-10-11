import type { SVGProps } from 'react'

/**
 * One icon family for the whole app: 24px grid, 1.6 stroke, round joins,
 * geometric construction. Everything draws in `currentColor`.
 */
export type IconName =
  | 'alarm'
  | 'bell'
  | 'bolt'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'doc'
  | 'edit'
  | 'history'
  | 'home'
  | 'info'
  | 'monitor'
  | 'moon'
  | 'pause'
  | 'play'
  | 'plus'
  | 'repeat'
  | 'settings'
  | 'shield'
  | 'snooze'
  | 'sparkle'
  | 'sun'
  | 'tag'
  | 'trash'
  | 'vibrate'
  | 'volume'
  | 'volume-off'
  | 'waves'

const PATHS: Record<IconName, string[]> = {
  alarm: ['M12 13V9.5', 'M12 13l3 1.8', 'M5.2 3.4 2.6 6.4', 'M18.8 3.4l2.6 3'],
  bell: ['M18 8.5a6 6 0 1 0-12 0c0 5.5-2.2 6.5-2.2 6.5h16.4S18 14 18 8.5', 'M13.8 19a2.1 2.1 0 0 1-3.6 0'],
  bolt: ['M13.6 3 6.5 13.6h4.6L10.4 21l7.1-10.6h-4.6z'],
  calendar: ['M8 3v3.5', 'M16 3v3.5', 'M3.5 10.5h17'],
  check: ['M4.8 12.4 9.4 17 19.2 7'],
  'chevron-down': ['M5.5 9.5 12 16l6.5-6.5'],
  'chevron-left': ['M14.5 5.5 8 12l6.5 6.5'],
  'chevron-right': ['M9.5 5.5 16 12l-6.5 6.5'],
  clock: ['M12 7v5l3.4 2'],
  close: ['M6.2 6.2 17.8 17.8', 'M17.8 6.2 6.2 17.8'],
  doc: ['M13.2 3.4H7a1.5 1.5 0 0 0-1.5 1.5v14.2A1.5 1.5 0 0 0 7 20.6h10a1.5 1.5 0 0 0 1.5-1.5V8.7z', 'M13.2 3.4v5.3h5.3'],
  edit: ['M16.4 4.6l3 3', 'M4 20l1.1-4.2L16.2 4.7a1.9 1.9 0 0 1 2.7 0l.4.4a1.9 1.9 0 0 1 0 2.7L8.2 18.9z'],
  history: ['M3.6 12a8.4 8.4 0 1 0 2.6-6.1', 'M3.4 4.6v4.6h4.6', 'M12 8v4.3l3.2 1.9'],
  home: ['M4 10.4 12 4l8 6.4V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z'],
  info: ['M12 11.2v5', 'M12 7.6h.01'],
  monitor: ['M9 20.5h6', 'M12 17v3.5'],
  moon: ['M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8z'],
  pause: ['M9.4 5.5v13', 'M14.6 5.5v13'],
  play: ['M8.4 5.6 18 12l-9.6 6.4z'],
  plus: ['M12 5.2v13.6', 'M5.2 12h13.6'],
  repeat: ['M4 9.2a4 4 0 0 1 4-4h9.4', 'M15 2.8l2.6 2.4-2.6 2.4', 'M20 14.8a4 4 0 0 1-4 4H6.6', 'M9 21.2 6.4 18.8 9 16.4'],
  settings: ['M4 7.5h8.5', 'M17.5 7.5h2.5', 'M4 16.5h4.5', 'M13.5 16.5h6.5'],
  shield: ['M12 3.4 19 6.3v5.1c0 4.3-2.9 7.7-7 9.2-4.1-1.5-7-4.9-7-9.2V6.3z'],
  snooze: ['M8 7.2h5.6L8 15.4h5.6', 'M15.6 3.2h3.8l-3.8 5.2h3.8'],
  sparkle: ['M12 3.2l1.9 5.3 5.3 1.9-5.3 1.9L12 17.6l-1.9-5.3-5.3-1.9 5.3-1.9z'],
  sun: ['M12 2.6v2.2', 'M12 19.2v2.2', 'M4.3 4.3l1.6 1.6', 'M18.1 18.1l1.6 1.6', 'M2.6 12h2.2', 'M19.2 12h2.2', 'M4.3 19.7l1.6-1.6', 'M18.1 5.9l1.6-1.6'],
  tag: ['M4 10.9V5.6a1.6 1.6 0 0 1 1.6-1.6h5.3l9.1 9.1-6.9 6.9z'],
  trash: ['M4 7h16', 'M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7', 'M6.6 7l.8 11.7A2 2 0 0 0 9.4 20.6h5.2a2 2 0 0 0 2-1.9L17.4 7'],
  vibrate: ['M4.4 9.2v5.6', 'M2 10.6v2.8', 'M19.6 9.2v5.6', 'M22 10.6v2.8'],
  volume: ['M4 9.4h3L11 6v12L7 14.6H4z', 'M14.4 9.6a3.4 3.4 0 0 1 0 4.8', 'M17 7a7 7 0 0 1 0 10'],
  'volume-off': ['M4 9.4h3L11 6v12L7 14.6H4z', 'M15.4 10 20 14.6', 'M20 10l-4.6 4.6'],
  waves: ['M2.5 12c1.9-5.4 3.8-5.4 5.7 0s3.8 5.4 5.7 0 3.8-5.4 5.7 0'],
}

/** Icons that also need a circle or rect the path map cannot express. */
const SHAPES: Partial<Record<IconName, React.ReactNode>> = {
  alarm: <circle cx="12" cy="13" r="7.6" />,
  clock: <circle cx="12" cy="12" r="8.6" />,
  info: <circle cx="12" cy="12" r="8.6" />,
  calendar: <rect x="3.5" y="5" width="17" height="15.5" rx="2.4" />,
  monitor: <rect x="3" y="4.5" width="18" height="12.5" rx="2" />,
  settings: (
    <>
      <circle cx="15" cy="7.5" r="2.4" />
      <circle cx="11" cy="16.5" r="2.4" />
    </>
  ),
  sun: <circle cx="12" cy="12" r="4.2" />,
  tag: <circle cx="8.4" cy="8.4" r="1.15" />,
  vibrate: <rect x="7.4" y="4.4" width="9.2" height="15.2" rx="1.9" />,
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {SHAPES[name]}
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
