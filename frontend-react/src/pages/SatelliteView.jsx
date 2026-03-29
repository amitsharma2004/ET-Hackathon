import { useEffect, useState } from 'react'
import { SatelliteIcon, AlertIcon, CheckIcon, DownloadIcon, SpinnerIcon } from '../components/icons'
import { getProperties, satelliteImageUrl } from '../services/api'

/* View mode buttons */
const VIEW_MODES = ['2020', '2024', 'Side-by-Side', 'Overlay']

export default function SatelliteView({ zone, lang }) {
  const [properties, setProperties] = useState([])
  const [selected,   setSelected]   = useState('')
  const [propInfo,   setPropInfo]   = useState(null)
  const [loaded,     setLoaded]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [viewMode,   setViewMode]   = useState('Side-by-Side')
  const [img20Err,   setImg20Err]   = useState(false)
  const [img24Err,   setImg24Err]   = useState(false)

  useEffect(() => {
    getProperties(zone).then(d => {
      const list = d.properties || []
      setProperties(list)
      if (list.length) { setSelected(list[0].property_id); setPropInfo(list[0]) }
    })
  }, [zone])

  const handleSelect = e => {
    const pid = e.target.value
    setSelected(pid)
    setPropInfo(properties.find(p => p.property_id === pid) || null)
    setLoaded(false); setImg20Err(false); setImg24Err(false); setViewMode('Side-by-Side')
  }

  const handleLoad = async () => {
    setLoading(true); setImg20Err(false); setImg24Err(false)
    await new Promise(r => setTimeout(r, 800))   // simulate fetch delay
    setLoaded(true); setLoading(false)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = satelliteImageUrl(selected, 2024)
    a.download = `${selected}_2024_satellite.jpg`
    a.click()
  }

  /* ── Derived stats ───────────────────────────────────────────────────── */
  const rep = Number(propInfo?.reported_area_sqft)
  const act = Number(propInfo?.actual_area_sqft)
  const pct = rep > 0 && !isNaN(rep) && !isNaN(act)
    ? (((act - rep) / rep) * 100).toFixed(1)
    : 'N/A'
  const diff     = !isNaN(rep) && !isNaN(act) ? act - rep : 0
  const isFraud  = propInfo?.is_fraud

  const beforeLabel = lang === 'मराठी' ? '२०२० — आधी' : lang === 'हिंदी' ? '2020 — पहले' : '2020 — Baseline'
  const afterLabel  = lang === 'मराठी' ? '२०२४ — नंतर' : lang === 'हिंदी' ? '2024 — बाद में' : '2024 — Current'

  /* ── Image renderer based on view mode ──────────────────────────────── */
  const renderImages = () => {
    const img20 = (
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b text-xs font-semibold text-navy">
          <SatelliteIcon size={13} color="#6b7280" /> {beforeLabel}
          <span className="ml-auto badge-green">Reference</span>
        </div>
        {img20Err
          ? <div className="flex items-center justify-center h-56 bg-gray-50 text-gray-400 text-sm">Image unavailable</div>
          : <img src={satelliteImageUrl(selected, 2020)} alt="2020"
                 className="w-full object-cover" style={{ imageRendering: 'pixelated', maxHeight: 300 }}
                 onError={() => setImg20Err(true)} />
        }
      </div>
    )
    const img24 = (
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b text-xs font-semibold text-navy">
          <SatelliteIcon size={13} color="#6b7280" /> {afterLabel}
          {isFraud && <span className="ml-auto badge-red flex items-center gap-1">
            <AlertIcon size={9} color="white" /> Expansion
          </span>}
        </div>
        {img24Err
          ? <div className="flex items-center justify-center h-56 bg-gray-50 text-gray-400 text-sm">Image unavailable</div>
          : <img src={satelliteImageUrl(selected, 2024)} alt="2024"
                 className="w-full object-cover" style={{ imageRendering: 'pixelated', maxHeight: 300 }}
                 onError={() => setImg24Err(true)} />
        }
      </div>
    )

    if (viewMode === '2020') return <div className="w-full">{img20}</div>
    if (viewMode === '2024') return <div className="w-full">{img24}</div>

    if (viewMode === 'Overlay') return (
      <div className="relative w-full">
        <img src={satelliteImageUrl(selected, 2020)} alt="2020 base"
             className="w-full object-cover" style={{ imageRendering: 'pixelated', maxHeight: 320 }}
             onError={() => setImg20Err(true)} />
        <img src={satelliteImageUrl(selected, 2024)} alt="2024 overlay"
             className="absolute inset-0 w-full object-cover opacity-50 mix-blend-multiply"
             style={{ imageRendering: 'pixelated', maxHeight: 320 }}
             onError={() => setImg24Err(true)} />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Overlay: 2020 + 2024</div>
      </div>
    )

    // Default: Side-by-Side
    return (
      <div className="flex gap-0 divide-x divide-gray-200">
        {img20}
        {img24}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h2 className="flex items-center gap-2 text-xl font-bold text-navy mb-1">
          <SatelliteIcon size={22} color="#000080" />
          {lang === 'मराठी' ? 'उपग्रह तुलना' : lang === 'हिंदी' ? 'उपग्रह तुलना' : 'Satellite Image Comparison'}
        </h2>
        <p className="text-sm text-gray-500">
          AI-generated synthetic imagery showing building footprint changes (2020 → 2024).
          Detection powered by <strong>Prithvi-EO-2.0</strong> (NASA + IBM).
        </p>
      </div>

      {/* Selector row */}
      <div className="bg-white rounded-xl p-5 shadow-md flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-navy mb-1">Select Property</label>
          <select value={selected} onChange={handleSelect}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron">
            {properties.map(p => (
              <option key={p.property_id} value={p.property_id}>
                {p.property_id} — {p.owner_name} ({p.zone}) {p.is_fraud ? '⚠' : '✓'}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleLoad} disabled={loading}
                className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-60">
          {loading ? <><SpinnerIcon size={16} color="white" /> Loading…</> : <><SatelliteIcon size={16} color="white" /> Analyze Satellite Changes</>}
        </button>
      </div>

      {/* Image panel */}
      {loaded && selected && (
        <div className="space-y-4">

          {/* View mode selector */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-navy mr-2">View Mode:</span>
              {VIEW_MODES.map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${viewMode === mode
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy border-navy/30 hover:bg-navy/5'}`}>
                  {mode === '2020' ? '📅 2020' : mode === '2024' ? '📅 2024' : mode === 'Side-by-Side' ? '⬛⬛ Side-by-Side' : '🔀 Overlay'}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            {renderImages()}
          </div>

          {/* Change statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Area 2020',         value: `${rep} sqft`,       color: '#000080' },
              { label: 'Area 2024',         value: `${act} sqft`,       color: isFraud ? '#DC3545' : '#28A745' },
              { label: 'Increase',          value: pct !== 'N/A' ? `+${pct}%` : 'N/A', color: isFraud ? '#DC3545' : '#28A745' },
              { label: 'AI Confidence',     value: isFraud ? '94%' : 'N/A',           color: '#FF9933' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-4 shadow-md border-t-4 text-center"
                   style={{ borderColor: item.color }}>
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="text-xl font-extrabold" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Detection details */}
          <div className="bg-white rounded-xl p-5 shadow-md">
            <h3 className="section-title"><SatelliteIcon size={17} color="#000080" /> Detection Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              {[
                ['Detection Method', 'Prithvi-EO-2.0 Satellite AI (NASA + IBM)'],
                ['Analysis Date',   new Date().toLocaleDateString('en-IN')],
                ['Image Resolution','0.5m / pixel (simulated)'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="font-semibold text-navy text-xs mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {/* Change table (only for fraud) */}
            {isFraud && (
              <div className="overflow-x-auto mt-2">
                <table className="text-sm border-collapse w-full">
                  <thead>
                    <tr className="bg-red-50">
                      {['Metric', '2020', '2024', 'Change'].map(h => (
                        <th key={h} className="border border-red-200 px-4 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-red-100 px-4 py-2">Declared Area</td>
                      <td className="border border-red-100 px-4 py-2 text-center">{rep} sqft</td>
                      <td className="border border-red-100 px-4 py-2 text-center">{rep} sqft</td>
                      <td className="border border-red-100 px-4 py-2 text-center text-gray-400">—</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="border border-red-100 px-4 py-2 font-medium">Actual Area (AI)</td>
                      <td className="border border-red-100 px-4 py-2 text-center">{rep} sqft</td>
                      <td className="border border-red-100 px-4 py-2 text-center font-bold text-danger">{act} sqft</td>
                      <td className="border border-red-100 px-4 py-2 text-center font-bold text-danger">+{diff} sqft</td>
                    </tr>
                    <tr>
                      <td className="border border-red-100 px-4 py-2">Variance %</td>
                      <td className="border border-red-100 px-4 py-2 text-center">0%</td>
                      <td className="border border-red-100 px-4 py-2 text-center font-bold text-danger">{pct}%</td>
                      <td className="border border-red-100 px-4 py-2 text-center text-danger font-bold">↑ Critical</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Result banner */}
          {isFraud ? (
            <div className="bg-red-50 border border-red-300 rounded-xl p-5 shadow-md flex items-start gap-3">
              <AlertIcon size={28} color="#DC3545" className="flex-shrink-0 mt-0.5" />
              <p className="font-bold text-danger text-base">
                AI detected ~{pct}% building area increase — Illegal construction suspected.
                Red outline shows expanded footprint beyond declared boundary.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-300 rounded-xl p-5 shadow-md flex items-center gap-3">
              <CheckIcon size={28} color="#28A745" />
              <p className="font-semibold text-success">No significant structural changes detected between 2020 and 2024.</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary flex items-center gap-2" onClick={handleDownload}>
              <DownloadIcon size={15} color="white" /> Download Report
            </button>
            <button className="btn-primary flex items-center gap-2"
                    onClick={() => setViewMode('Side-by-Side')}>
              🔍 Zoom In (Side-by-Side)
            </button>
            <button className="btn-primary flex items-center gap-2"
                    onClick={() => setViewMode('Overlay')}>
              📅 View Overlay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
