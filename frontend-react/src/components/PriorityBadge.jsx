import { AlertIcon, CheckIcon, ShieldIcon } from './icons'

const CONFIG = {
  100: { label: 'Critical',      bg: '#DC3545', Icon: AlertIcon  },
  85:  { label: 'High Priority', bg: '#e65100', Icon: AlertIcon  },
  60:  { label: 'Medium',        bg: '#FFC107', Icon: ShieldIcon },
  20:  { label: 'Low',           bg: '#28A745', Icon: CheckIcon  },
}

export default function PriorityBadge({ score }) {
  const cfg = CONFIG[score] || CONFIG[20]
  const { Icon } = cfg
  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <span
        className="text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg flex items-center gap-2"
        style={{ backgroundColor: cfg.bg }}
      >
        <Icon size={20} color="white" strokeWidth={2.2} />
        {cfg.label} — Score: {score}/100
      </span>
      {/* Progress bar */}
      <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: cfg.bg }}
        />
      </div>
    </div>
  )
}
