/**
 * RevenueGuard AI — Custom SVG Icon Library
 * All icons accept: size (default 20), color (default "currentColor"), className
 */

const Icon = ({ size = 20, color = 'currentColor', className = '', children, viewBox = '0 0 24 24' }) => (
  <svg
    width={size} height={size} viewBox={viewBox}
    fill="none" stroke={color} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true"
  >
    {children}
  </svg>
)

/* ── Navigation ─────────────────────────────────────────────────────────── */

/** Grid dashboard */
export const DashboardIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
)

/** Magnifying glass */
export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </Icon>
)

/** Satellite dish */
export const SatelliteIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill={p.color || 'currentColor'} fillOpacity="0.15" />
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Icon>
)

/** Bar chart / reports */
export const ReportsIcon = (p) => (
  <Icon {...p}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6"  y1="20" x2="6"  y2="14" />
    <line x1="2"  y1="20" x2="22" y2="20" />
  </Icon>
)

/* ── KPI / Stats ─────────────────────────────────────────────────────────── */

/** Building / property */
export const BuildingIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="9" width="18" height="13" rx="1" />
    <path d="M8 22V12h8v10" />
    <path d="M3 9l9-7 9 7" />
    <line x1="12" y1="2" x2="12" y2="9" />
  </Icon>
)

/** Alert triangle */
export const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
)

/** Indian Rupee coin */
export const RupeeIcon = (p) => (
  <Icon {...p} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 8h5a3 3 0 0 1 0 6H8" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="11" y1="14" x2="16" y2="20" />
  </Icon>
)

/** Trending up */
export const TrendUpIcon = (p) => (
  <Icon {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
)

/* ── Agents ─────────────────────────────────────────────────────────────── */

/** House — Property agent */
export const HouseIcon = (p) => (
  <Icon {...p}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </Icon>
)

/** Water drop — Water agent */
export const WaterIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2C6.48 2 2 8 2 13a10 10 0 0 0 20 0c0-5-4.48-11-10-11z" />
    <path d="M12 6c0 0-5 4.5-5 7.5a5 5 0 0 0 10 0C17 10.5 12 6 12 6z" fill={p.color || 'currentColor'} fillOpacity="0.15" />
  </Icon>
)

/** Store / shop — Trade agent */
export const StoreIcon = (p) => (
  <Icon {...p}>
    <path d="M2 3h20l-2 8H4L2 3z" />
    <path d="M4 11v10h16V11" />
    <path d="M9 11v10" />
    <path d="M15 11v10" />
    <path d="M9 15h6" />
  </Icon>
)

/** Robot / AI brain */
export const RobotIcon = (p) => (
  <Icon {...p}>
    <rect x="5" y="8" width="14" height="10" rx="2" />
    <circle cx="9" cy="13" r="1.2" fill={p.color || 'currentColor'} />
    <circle cx="15" cy="13" r="1.2" fill={p.color || 'currentColor'} />
    <path d="M9 17h6" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1.5" />
    <path d="M5 12H3" />
    <path d="M21 12h-2" />
  </Icon>
)

/* ── Actions / Status ───────────────────────────────────────────────────── */

/** Check circle */
export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
)

/** X circle */
export const XIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
)

/** Send / paper plane */
export const SendIcon = (p) => (
  <Icon {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
)

/** Calendar */
export const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </Icon>
)

/** Download */
export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
)

/** Map pin */
export const MapPinIcon = (p) => (
  <Icon {...p}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
)

/** WhatsApp-style phone chat */
export const WhatsAppIcon = (p) => (
  <Icon {...p} viewBox="0 0 24 24" stroke="none" fill={p.color || 'currentColor'}>
    <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.2-1.57A11.96 11.96 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zm-8.52 18c-1.79 0-3.54-.48-5.07-1.38l-.36-.22-3.74.95.99-3.65-.24-.38A9.93 9.93 0 0 1 2 12c0-5.51 4.49-10 10-10s10 4.49 10 10-4.49 10-10 10zm5.47-7.43l-1.38-.63a.75.75 0 0 0-.83.15l-.7.71c-.13.13-.32.17-.49.1-1.13-.47-3.36-2.7-3.83-3.83a.41.41 0 0 1 .1-.49l.7-.7a.75.75 0 0 0 .15-.83l-.63-1.38a.75.75 0 0 0-.97-.37c-.56.23-1.07.64-1.43 1.19-.65 1 .27 3.2 2.16 5.09 1.89 1.89 4.09 2.81 5.09 2.16.55-.36.96-.87 1.19-1.43a.75.75 0 0 0-.37-.97z" />
  </Icon>
)

/** Language / globe */
export const GlobeIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
)

/** Zone / layers */
export const ZoneIcon = (p) => (
  <Icon {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Icon>
)

/** Shield — protection */
export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </Icon>
)

/** Loader / spinner (animated) */
export const SpinnerIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2"
    strokeLinecap="round" className={`animate-spin ${className}`}
    aria-label="Loading"
  >
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)
