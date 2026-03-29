import { NavLink } from 'react-router-dom'
import {
  DashboardIcon, SearchIcon, SatelliteIcon, ReportsIcon,
  GlobeIcon, ZoneIcon, ShieldIcon,
} from './icons'

const NAV = [
  { to: '/',          Icon: DashboardIcon, label: 'Dashboard'         },
  { to: '/analysis',  Icon: SearchIcon,    label: 'Property Analysis' },
  { to: '/satellite', Icon: SatelliteIcon, label: 'Satellite View'    },
  { to: '/reports',   Icon: ReportsIcon,   label: 'Reports'           },
]

const ZONES = ['All Zones', 'Zone-A', 'Zone-B', 'Zone-C']
const LANGS = ['English', 'हिंदी', 'मराठी']

export default function Sidebar({ zone, setZone, lang, setLang, backendOk }) {
  return (
    <aside className="w-64 min-h-screen bg-navy flex flex-col py-6 px-3 shadow-2xl">

      {/* Logo */}
      <div className="px-3 mb-8 flex items-center gap-3">
        <div className="bg-saffron/20 p-2 rounded-xl">
          <ShieldIcon size={28} color="#FF9933" />
        </div>
        <div>
          <div className="text-saffron font-extrabold text-lg leading-tight">RevenueGuard</div>
          <div className="text-gray-400 text-xs">AI — Municipal Guard</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 mb-8">
        {NAV.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Filters */}
      <div className="px-2 flex flex-col gap-4">
        {/* Zone */}
        <div>
          <label className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <ZoneIcon size={13} color="#9ca3af" /> Zone Filter
          </label>
          <select
            value={zone} onChange={e => setZone(e.target.value)}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-saffron"
          >
            {ZONES.map(z => <option key={z} value={z} className="text-black">{z}</option>)}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <GlobeIcon size={13} color="#9ca3af" /> Language
          </label>
          <select
            value={lang} onChange={e => setLang(e.target.value)}
            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-saffron"
          >
            {LANGS.map(l => <option key={l} value={l} className="text-black">{l}</option>)}
          </select>
        </div>
      </div>

      {/* Backend status */}
      <div className="mt-auto px-2 space-y-3">
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg
          ${backendOk ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse
            ${backendOk ? 'bg-green-400' : 'bg-yellow-400'}`} />
          {backendOk ? 'Backend Connected' : 'Local Mode'}
        </div>
        <p className="text-gray-600 text-xs text-center leading-relaxed">
          Ref: Jabalpur ₹30Cr Recovery<br />Prithvi-EO-2.0 Satellite
        </p>
      </div>
    </aside>
  )
}
