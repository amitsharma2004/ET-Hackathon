import { useState } from 'react'
import { CheckIcon, XIcon, AlertIcon } from './icons'

/**
 * Displays a single AI agent's analysis result with a "View Agent Logs" modal.
 * `icon` — SVG icon component
 * `result` — agent analysis result object
 * `logs` — optional array of log strings shown in the modal
 */
export default function AgentCard({ title, icon: IconComp, result, logs = [] }) {
  const [showLogs, setShowLogs] = useState(false)

  if (!result) return null
  const { flagged, confidence, reason, evidence } = result
  const borderColor = flagged ? '#DC3545' : '#28A745'
  const bgAccent    = flagged ? '#fef2f2' : '#f0fdf4'
  const StatusIcon  = flagged ? XIcon : CheckIcon
  const statusText  = flagged ? 'FLAGGED' : 'CLEAR'

  // Default log lines when none provided
  const defaultLogs = [
    `[INIT]  Agent started for ${result.agent || title}`,
    `[DATA]  Loading property records...`,
    `[PROC]  ${reason?.slice(0, 80) ?? 'Processing...'}`,
    `[EVID]  ${evidence?.slice(0, 80) ?? 'Evidence collected'}`,
    `[DONE]  Confidence score: ${confidence}% | Status: ${flagged ? 'FLAGGED ⚠' : 'CLEAR ✓'}`,
  ]
  const logLines = logs.length ? logs : defaultLogs

  return (
    <>
      {/* Card */}
      <div
        className="agent-card transition-shadow hover:shadow-lg"
        style={{ borderLeftColor: borderColor, backgroundColor: bgAccent }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {IconComp && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: `${borderColor}20` }}>
                <IconComp size={18} color={borderColor} />
              </div>
            )}
            <span className="font-bold text-navy text-sm">{title}</span>
          </div>
          <span className={`${flagged ? 'badge-red' : 'badge-green'} flex items-center gap-1`}>
            <StatusIcon size={10} color="white" strokeWidth={2.5} />
            {statusText}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="mt-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Confidence</span>
            <span className="font-bold" style={{ color: borderColor }}>{confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all duration-700"
                 style={{ width: `${confidence}%`, backgroundColor: borderColor }} />
          </div>
        </div>

        {/* Issue */}
        <div className="bg-white/70 rounded-lg p-2.5 text-xs space-y-1.5 border border-gray-100">
          <div>
            <span className="font-semibold text-gray-700">Issue: </span>
            <span className="text-gray-600">{reason?.slice(0, 120)}{reason?.length > 120 ? '…' : ''}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Evidence: </span>
            <span className="text-gray-500 italic">{evidence?.slice(0, 100)}{evidence?.length > 100 ? '…' : ''}</span>
          </div>
        </div>

        {/* View logs button */}
        <button
          onClick={() => setShowLogs(true)}
          className="w-full text-xs font-semibold py-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95"
          style={{ borderColor, color: borderColor, backgroundColor: `${borderColor}10` }}
        >
          📋 View Agent Logs
        </button>
      </div>

      {/* Logs modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowLogs(false)}>
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
               onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                {IconComp && <IconComp size={16} color="#4ade80" />}
                <span className="text-green-400 font-bold text-sm font-mono">{title} — Execution Logs</span>
              </div>
              <button onClick={() => setShowLogs(false)}
                      className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
            </div>

            {/* Log lines */}
            <div className="p-5 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
              {logLines.map((line, i) => {
                const isError = line.includes('ERROR') || line.includes('FLAGGED')
                const isOk    = line.includes('DONE') || line.includes('CLEAR')
                return (
                  <div key={i} className={`flex gap-2 ${isError ? 'text-red-400' : isOk ? 'text-green-400' : 'text-gray-300'}`}>
                    <span className="text-gray-600 select-none">{String(i + 1).padStart(2, '0')}</span>
                    <span>{line}</span>
                  </div>
                )
              })}
              <div className="flex items-center gap-1 text-green-400 mt-2">
                <span className="inline-block w-2 h-3 bg-green-400 animate-pulse" />
                <span>Process complete</span>
              </div>
            </div>

            {/* Status footer */}
            <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-between">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${flagged ? 'text-red-400' : 'text-green-400'}`}>
                {flagged
                  ? <><AlertIcon size={13} color="#f87171" /> Anomaly detected</>
                  : <><CheckIcon size={13} color="#4ade80" /> No violations found</>
                }
              </span>
              <button onClick={() => setShowLogs(false)}
                      className="btn-secondary text-xs px-4 py-1.5">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
