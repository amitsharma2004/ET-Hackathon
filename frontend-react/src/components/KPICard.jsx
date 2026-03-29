import { useEffect, useRef, useState } from 'react'

/**
 * KPI card with:
 *  - SVG icon in coloured circle
 *  - count-up animation for numeric values
 *  - optional pulse ring if `pulse` prop is true (high-alert cards)
 */
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    // Extract numeric part from value (handles "₹6.7L", "60", "30%")
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    if (isNaN(numeric)) { setDisplay(target); return }

    let start = null
    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numeric * eased

      // Reconstruct display value matching original format
      const str = String(target)
      if (str.startsWith('₹') && str.endsWith('L')) {
        setDisplay(`₹${current.toFixed(1)}L`)
      } else if (str.endsWith('%')) {
        setDisplay(`${Math.round(current)}%`)
      } else if (str.includes('.')) {
        setDisplay(current.toFixed(1))
      } else {
        setDisplay(Math.round(current))
      }

      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return display
}

export default function KPICard({ label, value, icon: IconComp, iconProps = {}, color = '#FF9933', sub, pulse = false }) {
  const animated = useCountUp(value)

  return (
    <div className={`kpi-card relative overflow-hidden ${pulse ? 'ring-2 ring-offset-2 ring-danger animate-pulse-ring' : ''}`}
         style={{ borderTopColor: color }}>
      {/* Background watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        {IconComp && <IconComp size={80} color={color} />}
      </div>

      {/* Icon circle */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
           style={{ backgroundColor: `${color}1A` }}>
        {IconComp && <IconComp size={24} color={color} {...iconProps} />}
      </div>

      {/* Value with count-up */}
      <div className="text-2xl font-extrabold tabular-nums" style={{ color }}>
        {animated}
      </div>

      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
