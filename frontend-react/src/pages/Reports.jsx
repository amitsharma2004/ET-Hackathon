import { useEffect, useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { ReportsIcon, AlertIcon, RupeeIcon, TrendUpIcon, DownloadIcon } from '../components/icons'
import { getProperties, getDashboardStats } from '../services/api'

const MONTHS  = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
const RECOVERY = [12.5,14.2,11.8,16.0,18.5,15.3,19.2,21.0,17.8,22.5,25.0,28.3]

export default function Reports({ zone }) {
  const [props,  setProps]  = useState([])
  const [stats,  setStats]  = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getProperties(zone), getDashboardStats(zone)])
      .then(([p, s]) => { setProps(p.properties || []); setStats(s) })
      .catch(console.error)
  }, [zone])

  const fraudProps = useMemo(() => props.filter(p => p.is_fraud), [props])
  const totalLoss  = useMemo(() => fraudProps.reduce((s, p) => s + (p.annual_loss || 0), 0), [fraudProps])

  const filtered = useMemo(() =>
    fraudProps.filter(p =>
      !search ||
      p.property_id.includes(search.toUpperCase()) ||
      p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      p.zone.toLowerCase().includes(search.toLowerCase())
    ),
  [fraudProps, search])

  const trendData = MONTHS.map((m, i) => ({ month: m, recovered: RECOVERY[i] }))

  const downloadCSV = () => {
    const headers = ['Property ID','Owner','Zone','Reported sqft','Actual sqft','Phone']
    const rows    = filtered.map(p => [p.property_id, p.owner_name, p.zone, p.reported_area_sqft, p.actual_area_sqft, p.phone])
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href = url; a.download = 'fraud_report.csv'; a.click()
  }

  const impactCards = [
    { label: 'Total Annual Loss',  value: `₹${(totalLoss/100000).toFixed(1)} Lakhs`,        color:'#DC3545', Icon: RupeeIcon   },
    { label: '5-Year Projection',  value: `₹${(totalLoss*5/10000000).toFixed(2)} Crores`,   color:'#e65100', Icon: TrendUpIcon },
    { label: 'With Penalty (25%)', value: `₹${(totalLoss*1.25/100000).toFixed(1)} Lakhs`,   color:'#FFC107', Icon: AlertIcon   },
  ]

  return (
    <div className="space-y-6">
      {/* Impact cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {impactCards.map(item => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-md border-l-4 flex items-center gap-4"
               style={{ borderColor: item.color }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: `${item.color}18` }}>
              <item.Icon size={22} color={item.color} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</div>
              <div className="text-2xl font-extrabold mt-0.5" style={{ color: item.color }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="section-title">
          <TrendUpIcon size={17} color="#000080" /> Monthly Revenue Recovery Trend (₹ Lakhs)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => [`₹${v}L`, 'Recovered']} />
            <Legend />
            <Line type="monotone" dataKey="recovered" stroke="#FF9933" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#FF9933' }} activeDot={{ r: 6 }} name="₹ Lakhs Recovered" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="section-title mb-0">
            <AlertIcon size={17} color="#DC3545" /> All Flagged Properties ({filtered.length})
          </h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Search ID / Owner / Zone…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron w-52" />
            <button onClick={downloadCSV} className="btn-secondary text-sm flex items-center gap-2">
              <DownloadIcon size={14} color="white" /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                {['Property ID','Owner','Zone','Reported sqft','Actual sqft','Variance','Phone'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const rep = Number(p.reported_area_sqft)
                const act = Number(p.actual_area_sqft)
                const varianceDisplay = (!rep || isNaN(rep) || isNaN(act))
                  ? 'N/A'
                  : `+${(((act - rep) / rep) * 100).toFixed(1)}%`
                return (
                  <tr key={p.property_id}
                      className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}>
                    <td className="px-4 py-3 font-mono font-semibold text-navy text-xs">{p.property_id}</td>
                    <td className="px-4 py-3">{p.owner_name}</td>
                    <td className="px-4 py-3"><span className="badge-orange">{p.zone}</span></td>
                    <td className="px-4 py-3">{rep || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-danger">{act || 'N/A'}</td>
                    <td className={`px-4 py-3 font-bold ${varianceDisplay === 'N/A' ? 'text-gray-400' : 'text-danger'}`}>{varianceDisplay}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.phone}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-2">
        <ReportsIcon size={18} color="#1d4ed8" className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Reference:</strong> Jabalpur recovered ₹30 Crores using similar technology.
          Bengaluru reduced water revenue leakage by 30% through consumption cross-referencing.
          This system scales to 200+ Indian cities.
        </span>
      </div>
    </div>
  )
}
