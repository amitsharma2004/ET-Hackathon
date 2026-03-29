import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import KPICard from '../components/KPICard'
import VoiceQuery from '../components/VoiceQuery'
import { BuildingIcon, AlertIcon, RupeeIcon, TrendUpIcon, MapPinIcon, SpinnerIcon } from '../components/icons'
import { getDashboardStats, getProperties } from '../services/api'

const ZONE_COLORS = ['#DC3545', '#FFC107', '#FF9933']

/* Stable seeded positions */
function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* Risk level of a property */
function riskLevel(p) {
  if (!p.is_fraud) return 'clear'
  const rep = Number(p.reported_area_sqft) || 1
  const act = Number(p.actual_area_sqft)   || 1
  const pct = ((act - rep) / rep) * 100
  return pct >= 35 ? 'high' : 'medium'
}

const RISK_COLOR = { high: '#DC3545', medium: '#FFC107', clear: '#28A745' }

export default function Dashboard({ zone }) {
  const [stats,      setStats]      = useState(null)
  const [props,      setProps]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [mapFilter,  setMapFilter]  = useState('all')   // all | high | medium

  useEffect(() => {
    setLoading(true)
    Promise.all([getDashboardStats(zone), getProperties(zone)])
      .then(([s, p]) => { setStats(s); setProps(p.properties || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [zone])

  const markers = useMemo(() => {
    const rng = seededRandom(42)
    return props.slice(0, 150).map(p => ({
      ...p,
      lat:  18.48 + rng() * 0.10,
      lon:  73.82 + rng() * 0.10,
      risk: riskLevel(p),
    }))
  }, [props])

  const visibleMarkers = useMemo(() => {
    if (mapFilter === 'all')    return markers
    if (mapFilter === 'high')   return markers.filter(m => m.risk === 'high')
    if (mapFilter === 'medium') return markers.filter(m => m.risk === 'medium')
    return markers
  }, [markers, mapFilter])

  const barData = useMemo(() => {
    if (!stats?.zone_breakdown) return []
    return Object.entries(stats.zone_breakdown).map(([z, d]) => ({
      zone: z, Clear: d.total - d.fraud, Fraud: d.fraud,
    }))
  }, [stats])

  const pieData = useMemo(() => {
    if (!stats?.zone_breakdown) return []
    return Object.entries(stats.zone_breakdown).map(([z, d]) => ({
      name: z, value: Math.round(d.annual_loss / 1000),
    }))
  }, [stats])

  const topFraud   = useMemo(() => props.filter(p => p.is_fraud).slice(0, 8), [props])
  const fraudPct   = stats?.fraud_pct ?? 0
  const lossL      = stats ? (stats.total_annual_loss / 100000).toFixed(1) : 0
  const recL       = stats ? (stats.recovery_potential / 100000).toFixed(1) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <SpinnerIcon size={48} color="#FF9933" className="mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Properties"          value={stats?.total_properties ?? 0}
                 icon={BuildingIcon} color="#000080" />
        <KPICard label="Fraud Cases"               value={stats?.fraud_count ?? 0}
                 icon={AlertIcon}   color="#DC3545"
                 sub={`${fraudPct}% of total`}
                 pulse={fraudPct > 20} />
        <KPICard label="Revenue at Risk (Annual)"  value={`₹${lossL}L`}
                 icon={RupeeIcon}   color="#FFC107" />
        <KPICard label="Recovery Potential (70%)"  value={`₹${recL}L`}
                 icon={TrendUpIcon} color="#28A745"
                 sub="Estimated recoverable" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="section-title">
            <span className="w-5 h-5 rounded bg-navy/10 flex items-center justify-center">
              <BuildingIcon size={13} color="#000080" />
            </span>
            Fraud Distribution by Zone
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Clear" stackId="a" fill="#28A745" radius={[0,0,4,4]} />
              <Bar dataKey="Fraud" stackId="a" fill="#DC3545" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="section-title">
            <span className="w-5 h-5 rounded bg-warning/10 flex items-center justify-center">
              <RupeeIcon size={13} color="#FFC107" />
            </span>
            Revenue Loss by Zone (₹K)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                   dataKey="value" nameKey="name"
                   label={({ name, value }) => `${name}: ₹${value}K`}>
                {pieData.map((_, i) => <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v}K`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="section-title mb-0">
            <span className="w-5 h-5 rounded bg-saffron/10 flex items-center justify-center">
              <MapPinIcon size={13} color="#FF9933" />
            </span>
            Property Map — Pune
          </h3>
          {/* Filter buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all',    label: 'Show All',    color: '#6b7280' },
              { key: 'high',   label: '🔴 High Only',  color: '#DC3545' },
              { key: 'medium', label: '🟡 Medium Only', color: '#FFC107' },
            ].map(f => (
              <button key={f.key} onClick={() => setMapFilter(f.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                  ${mapFilter === f.key ? 'text-white' : 'bg-white hover:opacity-80'}`}
                style={mapFilter === f.key
                  ? { backgroundColor: f.color, borderColor: f.color }
                  : { color: f.color, borderColor: f.color }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '400px' }}>
          <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            {visibleMarkers.map(p => (
              <CircleMarker
                key={p.property_id}
                center={[p.lat, p.lon]}
                radius={p.risk === 'high' ? 9 : p.risk === 'medium' ? 7 : 6}
                pathOptions={{
                  color:       RISK_COLOR[p.risk],
                  fillColor:   RISK_COLOR[p.risk],
                  fillOpacity: 0.80,
                  weight:      p.risk === 'high' ? 2 : 1,
                }}
              >
                <Popup>
                  <div className="text-sm space-y-0.5">
                    <strong className="text-navy">{p.property_id}</strong><br />
                    <span>{p.owner_name}</span><br />
                    <span className="text-xs text-gray-500">{p.address?.slice(0, 45)}…</span><br />
                    <span>Zone: {p.zone} | {p.reported_area_sqft} sqft declared</span><br />
                    {p.is_fraud && (
                      <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        ⚠ {p.risk === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}
                      </span>
                    )}
                    {!p.is_fraud && (
                      <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        ✓ CLEAR
                      </span>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger inline-block" /> High Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning inline-block" /> Medium Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success inline-block" /> Clear</span>
          <span className="text-gray-400 ml-auto">Showing {visibleMarkers.length} of {markers.length} properties</span>
        </div>
      </div>

      {/* Top Fraud Table */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="section-title">
          <span className="w-5 h-5 rounded bg-danger/10 flex items-center justify-center">
            <AlertIcon size={13} color="#DC3545" />
          </span>
          Top Fraud Cases
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                {['Property ID','Owner','Zone','Declared Area','Actual Area','Variance','Phone'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topFraud.map((p, i) => {
                const rep = Number(p.reported_area_sqft)
                const act = Number(p.actual_area_sqft)
                const varianceDisplay = (!rep || isNaN(rep) || isNaN(act))
                  ? 'N/A'
                  : `+${(((act - rep) / rep) * 100).toFixed(1)}%`
                return (
                  <tr key={p.property_id}
                      className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}>
                    <td className="px-4 py-3 font-mono font-semibold text-navy text-xs">{p.property_id}</td>
                    <td className="px-4 py-3">{p.owner_name}</td>
                    <td className="px-4 py-3"><span className="badge-orange">{p.zone}</span></td>
                    <td className="px-4 py-3">{rep || 'N/A'} sqft</td>
                    <td className="px-4 py-3 text-danger font-semibold">{act || 'N/A'} sqft</td>
                    <td className={`px-4 py-3 font-bold ${varianceDisplay === 'N/A' ? 'text-gray-400' : 'text-danger'}`}>{varianceDisplay}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.phone}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voice Query — bottom of dashboard */}
      <VoiceQuery dashboardStats={stats} />
    </div>
  )
}
