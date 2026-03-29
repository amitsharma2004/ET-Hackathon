import { useEffect, useState } from 'react'
import AgentCard from '../components/AgentCard'
import PriorityBadge from '../components/PriorityBadge'
import RevenueBreakdown from '../components/RevenueBreakdown'
import NotificationPreview from '../components/NotificationPreview'
import VoiceQuery from '../components/VoiceQuery'
import {
  HouseIcon, WaterIcon, StoreIcon, RobotIcon, RupeeIcon,
  SendIcon, CalendarIcon, CheckIcon, SpinnerIcon, WhatsAppIcon, AlertIcon,
} from '../components/icons'
import { getProperties, analyzeProperty } from '../services/api'

/* ── Agent metadata ──────────────────────────────────────────────────────── */
const AGENT_META = {
  property_agent: { title: 'Property Agent', Icon: HouseIcon },
  water_agent:    { title: 'Water Agent',    Icon: WaterIcon  },
  trade_agent:    { title: 'Trade Agent',    Icon: StoreIcon  },
}

/* ── 4-step animated execution ───────────────────────────────────────────── */
const EXEC_STEPS = [
  {
    key: 'prop',
    Icon:    HouseIcon,
    pending: 'Property Agent analyzing satellite imagery…',
    done:    'Found area discrepancy — flagging for review',
  },
  {
    key: 'water',
    Icon:    WaterIcon,
    pending: 'Water Agent querying consumption records…',
    done:    'Detected elevated monthly water usage',
  },
  {
    key: 'trade',
    Icon:    StoreIcon,
    pending: 'Trade Agent checking GST database…',
    done:    'GST cross-reference complete',
  },
  {
    key: 'super',
    Icon:    RobotIcon,
    pending: 'Supervisor correlating all agent findings…',
    done:    'Analysis complete — correlation score computed',
  },
]

/* ── Correlation score colour ────────────────────────────────────────────── */
function corrColor(score) {
  if (score >= 80) return '#DC3545'
  if (score >= 50) return '#FFC107'
  return '#28A745'
}

/* ── Agent log builder ───────────────────────────────────────────────────── */
function buildLogs(agentKey, result, propInfo) {
  const base = [
    `[INIT]  ${agentKey} initialised`,
    `[DATA]  Loaded property ${propInfo?.property_id ?? '—'} records`,
  ]
  if (agentKey === 'property_agent') {
    base.push(`[PROC]  Reported area: ${propInfo?.reported_area_sqft ?? '—'} sqft`)
    base.push(`[PROC]  Actual area  : ${propInfo?.actual_area_sqft ?? '—'} sqft`)
    base.push(`[CALC]  Difference   : ${result?.pct_diff ?? '—'}%`)
  } else if (agentKey === 'water_agent') {
    base.push(`[PROC]  Avg water    : ${result?.avg_water_liters ?? '—'} L/month`)
    base.push(`[PROC]  Avg elec     : ${result?.avg_elec_units ?? '—'} units/month`)
    base.push(`[THRS]  Residential threshold: 12,000 L/month`)
  } else if (agentKey === 'trade_agent') {
    base.push(`[PROC]  GST found    : ${result?.gst_found ? 'YES' : 'NO'}`)
    base.push(`[PROC]  Business     : ${result?.business_name ?? 'N/A'}`)
    base.push(`[PROC]  Trade license: ${result?.has_license ? 'VALID' : 'NOT FOUND'}`)
  }
  base.push(`[DONE]  Confidence ${result?.confidence ?? '—'}% | Status: ${result?.flagged ? 'FLAGGED ⚠' : 'CLEAR ✓'}`)
  return base
}

export default function PropertyAnalysis({ zone, lang }) {
  const [properties,  setProperties]  = useState([])
  const [selected,    setSelected]    = useState('')
  const [propInfo,    setPropInfo]    = useState(null)
  const [result,      setResult]      = useState(null)
  const [running,     setRunning]     = useState(false)   // analysis in progress
  const [stepsDone,   setStepsDone]   = useState([])      // completed step keys
  const [activeStep,  setActiveStep]  = useState(null)    // current step key
  const [showResults, setShowResults] = useState(false)
  const [actionMsg,   setActionMsg]   = useState('')

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
    setResult(null); setStepsDone([]); setActiveStep(null); setShowResults(false)
  }

  const handleAnalyze = async () => {
    if (!selected || running) return
    setResult(null); setStepsDone([]); setShowResults(false)
    setRunning(true)

    // Kick off real API call in background
    const apiPromise = analyzeProperty(selected).catch(() => null)

    // Animate the 4 steps
    for (const step of EXEC_STEPS) {
      setActiveStep(step.key)
      await new Promise(r => setTimeout(r, 700))
      setStepsDone(prev => [...prev, step.key])
      setActiveStep(null)
      await new Promise(r => setTimeout(r, 200))
    }

    const data = await apiPromise
    setResult(data)
    setRunning(false)
    setShowResults(true)
  }

  const handleAction = msg => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000) }

  const analyzeLabel = lang === 'मराठी' ? 'विश्लेषण करा' : lang === 'हिंदी' ? 'विश्लेषण करें' : 'Analyze Property'

  /* ── Derived values ────────────────────────────────────────────────────── */
  const corr    = result?.correlation
  const agents  = result?.agent_results
  const rev     = result?.revenue_impact
  const score   = corr?.score ?? 0
  const flagged = agents ? Object.values(agents).filter(a => a.flagged).length : 0

  // AI Reasoning text based on flagged count
  const aiReasoning = agents ? (() => {
    const pa = agents.property_agent?.flagged
    const wa = agents.water_agent?.flagged
    const ta = agents.trade_agent?.flagged
    const n  = [pa, wa, ta].filter(Boolean).length
    if (n === 3) return `All 3 agents confirm critical fraud. Property shows area expansion, commercial-level water consumption, and an unlicensed business — immediate action required.`
    if (pa && wa) return `${n}/3 agents agree on commercial fraud. Property shows area under-reporting AND water consumption at commercial levels (${agents.water_agent?.avg_water_liters?.toLocaleString('en-IN') ?? '—'} L/month).`
    if (pa && ta) return `${n}/3 agents flag this property. Area mismatch detected alongside an unlicensed business operating at the declared residential address.`
    if (wa && ta) return `${n}/3 agents flag commercial activity. High water consumption combined with an unlicensed GST-registered business indicates non-residential use.`
    if (pa) return `1/3 agents flagged: Property area appears under-reported by ${agents.property_agent?.pct_diff ?? '—'}%. Consider field verification.`
    if (wa) return `1/3 agents flagged: Water consumption exceeds residential norms. Could indicate commercial usage or a large household.`
    if (ta) return `1/3 agents flagged: A GST-registered business was found at this address without a valid municipal trade license.`
    return `All 3 agents returned clear results. No significant fraud indicators detected for this property.`
  })() : ''

  return (
    <div className="space-y-6">
      {/* ── Selector ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-md flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-navy mb-1">
            {lang === 'मराठी' ? 'मालमत्ता ID निवडा' : lang === 'हिंदी' ? 'संपत्ति ID चुनें' : 'Select Property ID'}
          </label>
          <select value={selected} onChange={handleSelect}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron">
            {properties.map(p => (
              <option key={p.property_id} value={p.property_id}>
                {p.property_id} — {p.owner_name} ({p.zone}) {p.is_fraud ? '⚠' : '✓'}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAnalyze} disabled={running || !selected}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
          {running
            ? <><SpinnerIcon size={16} color="white" /> Running…</>
            : <><RobotIcon size={16} color="white" /> {analyzeLabel}</>
          }
        </button>
      </div>

      {/* ── Property info ─────────────────────────────────────────────────── */}
      {propInfo && (
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="section-title"><HouseIcon size={17} color="#000080" /> Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            {[
              ['Property ID', propInfo.property_id],
              ['Owner',       propInfo.owner_name],
              ['Zone',        propInfo.zone],
              ['Category',    propInfo.declared_category],
              ['Declared Area', `${propInfo.reported_area_sqft} sqft`],
              ['Tax Amount',  `₹${Number(propInfo.tax_amount || 0).toLocaleString('en-IN')}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 text-xs">{k}</div>
                <div className="font-semibold text-navy truncate">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-500 flex flex-wrap items-center gap-4">
            <span>📍 {propInfo.address}</span>
            <span>📞 {propInfo.phone}</span>
          </div>
        </div>
      )}

      {/* ── 4-Step animated execution panel ──────────────────────────────── */}
      {(running || stepsDone.length > 0) && (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner">
          <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-2">
            <RobotIcon size={16} color="#FF9933" />
            <span className="text-saffron font-bold text-sm font-mono">Multi-Agent Execution Console</span>
            {running && <SpinnerIcon size={14} color="#FF9933" className="ml-auto" />}
          </div>
          <div className="p-5 space-y-3">
            {EXEC_STEPS.map((step, idx) => {
              const isDone    = stepsDone.includes(step.key)
              const isActive  = activeStep === step.key
              const isPending = !isDone && !isActive
              return (
                <div key={step.key}
                     className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all
                       ${isActive  ? 'bg-saffron/10 border border-saffron/40'
                       : isDone    ? 'bg-green-900/30'
                       : 'opacity-40'}`}>
                  {/* Step icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${isActive ? 'bg-saffron/30' : isDone ? 'bg-green-800' : 'bg-gray-700'}`}>
                    {isActive
                      ? <SpinnerIcon size={14} color="#FF9933" />
                      : isDone
                        ? <CheckIcon size={13} color="#4ade80" strokeWidth={2.5} />
                        : <step.Icon size={13} color="#6b7280" />
                    }
                  </div>
                  {/* Text */}
                  <div className="flex-1 font-mono text-xs">
                    <div className={isDone ? 'text-green-400' : isActive ? 'text-saffron' : 'text-gray-500'}>
                      Step {idx + 1}: {isActive ? step.pending : isDone ? `✅ ${step.done}` : step.pending}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {showResults && result && (
        <div className="space-y-5">

          {/* Priority badge */}
          <div className="bg-white rounded-xl p-5 shadow-md text-center">
            <PriorityBadge score={score} />
            <p className="text-sm text-gray-600 mt-2 font-medium">{corr?.fraud_type}</p>
          </div>

          {/* 3 Agent cards */}
          <div>
            <h3 className="section-title"><RobotIcon size={17} color="#000080" /> Agent Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(AGENT_META).map(([key, meta]) => (
                <AgentCard
                  key={key}
                  title={meta.title}
                  icon={meta.Icon}
                  result={agents?.[key]}
                  logs={buildLogs(key, agents?.[key], propInfo)}
                />
              ))}
            </div>
          </div>

          {/* Correlation score + AI reasoning */}
          <div className="bg-white rounded-xl p-5 shadow-md space-y-4">
            <h3 className="section-title"><AlertIcon size={17} color="#000080" /> Correlation Analysis</h3>

            {/* Score bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Correlation Score</span>
                <span className="text-2xl font-extrabold" style={{ color: corrColor(score) }}>{score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                     style={{ width: `${score}%`, backgroundColor: corrColor(score) }}>
                  <span className="text-white text-xs font-bold">{score}%</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low (0–49)</span><span>Medium (50–79)</span><span>High (80–100)</span>
              </div>
            </div>

            {/* Agents summary chips */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(AGENT_META).map(([key, meta]) => {
                const af = agents?.[key]?.flagged
                return (
                  <span key={key}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
                          ${af ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700'}`}>
                    <meta.Icon size={12} color={af ? '#DC3545' : '#28A745'} />
                    {meta.title}: {af ? '⚠ Flagged' : '✓ Clear'}
                  </span>
                )
              })}
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                {flagged}/3 agents agree
              </span>
            </div>

            {/* AI Reasoning box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <RobotIcon size={16} color="#1d4ed8" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">AI Reasoning</span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{aiReasoning}</p>
            </div>
          </div>

          {/* P4 — Detailed Revenue Breakdown */}
          <RevenueBreakdown propInfo={propInfo} revenueImpact={rev} />

          {/* P5 — Notification Preview (phone mockup + multilingual) */}
          <NotificationPreview
            propInfo={propInfo}
            revenueImpact={rev}
            correlationPriority={corr?.priority}
          />

          {/* Quick actions */}
          <div className="bg-white rounded-xl p-5 shadow-md">
            <h3 className="section-title"><CheckIcon size={17} color="#000080" /> Quick Actions</h3>
            {actionMsg && (
              <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                {actionMsg}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary flex items-center gap-2"
                      onClick={() => handleAction('Notice sent via email and SMS!')}>
                <SendIcon size={15} color="white" />
                {lang === 'मराठी' ? 'नोटीस पाठवा' : lang === 'हिंदी' ? 'नोटिस भेजें' : 'Send Notice'}
              </button>
              <button className="btn-secondary flex items-center gap-2"
                      onClick={() => handleAction('Field inspection scheduled for next week!')}>
                <CalendarIcon size={15} color="white" />
                {lang === 'मराठी' ? 'तपासणी शेड्यूल करा' : lang === 'हिंदी' ? 'निरीक्षण शेड्यूल करें' : 'Schedule Inspection'}
              </button>
              <button className="btn-success flex items-center gap-2"
                      onClick={() => handleAction('Case marked as resolved!')}>
                <CheckIcon size={15} color="white" />
                {lang === 'मराठी' ? 'सोडवलेले चिन्हांकित करा' : lang === 'हिंदी' ? 'हल किया गया' : 'Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* P6 — Voice Query (always visible) */}
      <VoiceQuery />
    </div>
  )
}
