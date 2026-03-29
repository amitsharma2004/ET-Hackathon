import { RupeeIcon, TrendUpIcon, AlertIcon, CheckIcon } from './icons'

const RESIDENTIAL_RATE = 2.5
const COMMERCIAL_RATE  = 8.5

/**
 * Two-column revenue comparison card:
 * Left  → Current (declared / residential)
 * Right → AI Detected (actual / commercial)
 */
export default function RevenueBreakdown({ propInfo, revenueImpact }) {
  if (!propInfo || !revenueImpact) return null

  const rep      = Number(propInfo.reported_area_sqft) || 0
  const act      = Number(propInfo.actual_area_sqft)   || 0
  const areaPct  = rep > 0 ? (((act - rep) / rep) * 100).toFixed(0) : 0
  const ratePct  = (((COMMERCIAL_RATE - RESIDENTIAL_RATE) / RESIDENTIAL_RATE) * 100).toFixed(0)

  const currentTax = revenueImpact.current_tax_annual  || 0
  const fairTax    = revenueImpact.fair_tax_annual     || 0
  const taxPct     = currentTax > 0 ? (((fairTax - currentTax) / currentTax) * 100).toFixed(0) : 0

  const annual    = revenueImpact.annual_loss          || 0
  const fiveYear  = revenueImpact.five_year_projection || 0
  const penalty   = revenueImpact.with_penalty         || 0

  const fmt = v => Number(v).toLocaleString('en-IN')

  return (
    <div className="bg-white rounded-xl p-5 shadow-md space-y-5">
      <h3 className="section-title">
        <RupeeIcon size={17} color="#000080" /> Revenue Breakdown
      </h3>

      {/* Two-column comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Left: Current (declared) ──────────────────────────────────── */}
        <div className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-navy inline-block" />
            <span className="font-bold text-navy text-sm">Current (Declared)</span>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Category',    'Residential',              'text-navy'],
              ['Area',        `${fmt(rep)} sqft`,         'text-gray-700'],
              ['Tax Rate',    `₹${RESIDENTIAL_RATE}/sqft`,'text-gray-700'],
              ['Annual Tax',  `₹${fmt(currentTax)}`,      'text-navy font-bold'],
            ].map(([k, v, cls]) => (
              <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{k}</span>
                <span className={cls}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: AI Detected (actual) ────────────────────────────────── */}
        <div className="border-2 border-saffron rounded-xl p-4 space-y-3 bg-orange-50/40">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-saffron inline-block" />
            <span className="font-bold text-saffron text-sm">AI Detected (Actual)</span>
          </div>
          <div className="space-y-2 text-sm">
            {/* Category */}
            <div className="flex justify-between items-center py-1.5 border-b border-orange-100">
              <span className="text-gray-500">Category</span>
              <span className="bg-saffron text-white text-xs font-bold px-2 py-0.5 rounded-full">Commercial</span>
            </div>
            {/* Area */}
            <div className="flex justify-between items-center py-1.5 border-b border-orange-100">
              <span className="text-gray-500">Area</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">{fmt(act)} sqft</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">+{areaPct}%</span>
              </span>
            </div>
            {/* Rate */}
            <div className="flex justify-between items-center py-1.5 border-b border-orange-100">
              <span className="text-gray-500">Tax Rate</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">₹{COMMERCIAL_RATE}/sqft</span>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">+{ratePct}%</span>
              </span>
            </div>
            {/* Tax */}
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-500">Annual Tax</span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-danger">₹{fmt(fairTax)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">+{taxPct}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Annual loss */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <AlertIcon size={16} color="#DC3545" />
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Annual Revenue Loss</span>
          </div>
          <div className="text-2xl font-extrabold text-danger">₹{fmt(annual)}</div>
          <div className="text-xs text-red-400 mt-1">Per year under-collection</div>
        </div>
        {/* 5-year */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendUpIcon size={16} color="#e65100" />
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">5-Year Projection</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-600">₹{fmt(fiveYear)}</div>
          <div className="text-xs text-orange-400 mt-1">Cumulative loss if unresolved</div>
        </div>
        {/* Recovery */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckIcon size={16} color="#28A745" />
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Recovery + 25% Penalty</span>
          </div>
          <div className="text-2xl font-extrabold text-success">₹{fmt(penalty)}</div>
          <div className="text-xs text-green-400 mt-1">Total recoverable amount</div>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 font-mono leading-relaxed">
        <span className="font-semibold text-gray-700 text-xs not-italic font-sans">Formula: </span>
        (Actual Area × Commercial Rate ₹{COMMERCIAL_RATE}/sqft) − (Reported Area × Residential Rate ₹{RESIDENTIAL_RATE}/sqft) = Annual Loss
        <br />
        <span className="text-gray-400">
          = ({fmt(act)} × {COMMERCIAL_RATE}) − ({fmt(rep)} × {RESIDENTIAL_RATE})
          = ₹{fmt(fairTax)} − ₹{fmt(currentTax)}
          = <span className="text-danger font-bold">₹{fmt(annual)}</span>
        </span>
      </div>
    </div>
  )
}
