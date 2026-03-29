import { useState, useRef } from 'react'
import { SearchIcon, SpinnerIcon } from './icons'

/* ── Simulated query knowledge base ─────────────────────────────────────── */
const QUERY_KB = [
  {
    patterns: ['zone b', 'zone-b', 'जोन b', 'झोन b'],
    interpreted: 'How many high-risk cases are in Zone B?',
    answer: 'Zone B has 12 high-priority fraud cases with ₹28.2L revenue at risk.',
  },
  {
    patterns: ['zone a', 'zone-a', 'जोन a', 'झोन a'],
    interpreted: 'How many high-risk cases are in Zone A?',
    answer: 'Zone A has 8 high-priority fraud cases with ₹19.5L revenue at risk.',
  },
  {
    patterns: ['zone c', 'zone-c', 'जोन c', 'झोन c'],
    interpreted: 'What is the revenue loss in Zone C?',
    answer: 'Zone C has 15 fraud cases with ₹31.4L total annual revenue loss.',
  },
  {
    patterns: ['high risk', 'high priority', 'उच्च जोखिम', 'हाई रिस्क', 'उच्च जोखीम'],
    interpreted: 'Show all high-risk properties.',
    answer: '35 properties are flagged as High Priority or Critical with a combined annual loss of ₹79.1L.',
  },
  {
    patterns: ['revenue', 'loss', 'total', 'नुकसान', 'महसूल', 'नुकसान'],
    interpreted: 'What is the total revenue loss?',
    answer: 'Total annual revenue loss across all 200 properties is ₹6.7 Lakhs. 5-year projection: ₹33.6 Lakhs.',
  },
  {
    patterns: ['fraud', 'फ्रॉड', 'धोखाधड़ी', 'फसवणूक'],
    interpreted: 'How many fraud cases are there?',
    answer: '60 out of 200 properties (30%) are flagged as fraud. Highest concentration in Zone C.',
  },
  {
    patterns: ['water', 'पानी', 'पाणी', 'consumption'],
    interpreted: 'Show properties with abnormal water consumption.',
    answer: '47 properties exceed the 12,000 L/month residential water threshold, indicating commercial usage.',
  },
  {
    patterns: ['gst', 'trade', 'license', 'व्यापार', 'परवाना'],
    interpreted: 'Show properties with GST but no trade license.',
    answer: '24 properties have GST-registered businesses operating without a valid municipal trade license.',
  },
  {
    patterns: ['pune', 'पुणे', 'municipal', 'नगरपालिका', 'महानगरपालिका'],
    interpreted: 'What is the overall city fraud summary?',
    answer: 'Pune city: 200 properties surveyed, 60 fraud cases, ₹6.7L annual loss. Comparable to Jabalpur\'s ₹30Cr recovery opportunity at scale.',
  },
]

const EXAMPLE_QUERIES = [
  'Zone B mein kitne cases hain?',
  'Show high risk properties',
  'Revenue loss in Zone C',
  'Total fraud cases kitne hain?',
  'Water consumption anomalies',
]

function resolveQuery(input) {
  const lower = input.toLowerCase()
  for (const entry of QUERY_KB) {
    if (entry.patterns.some(p => lower.includes(p))) return entry
  }
  return {
    interpreted: `"${input}" — General municipal property query`,
    answer: 'For detailed analysis, please use the Property Analysis tab or filter by zone in the Dashboard. Current data shows 60 fraud cases with ₹6.7L annual loss across 200 properties.',
  }
}

export default function VoiceQuery({ dashboardStats }) {
  const [query,       setQuery]       = useState('')
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [listening,   setListening]   = useState(false)
  const inputRef = useRef(null)

  const handleQuery = async (q = query) => {
    if (!q.trim()) return
    setLoading(true); setResult(null)
    await new Promise(r => setTimeout(r, 800))   // simulate AI processing
    setResult(resolveQuery(q))
    setLoading(false)
  }

  /* Web Speech API (browser permitting) */
  const handleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setQuery('Voice input not supported in this browser. Please type your query.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    setListening(true)
    recognition.start()
    recognition.onresult  = e => { setQuery(e.results[0][0].transcript); setListening(false) }
    recognition.onerror   = () => setListening(false)
    recognition.onend     = () => setListening(false)
  }

  const handleExample = q => { setQuery(q); handleQuery(q) }

  return (
    <div className="bg-white rounded-xl p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🎙️</span>
        <div>
          <h3 className="font-bold text-navy text-base">Voice / Text Query</h3>
          <p className="text-xs text-gray-500">Ask in Hindi, Marathi or English</p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
            placeholder="Bolo... (Speak in Hindi/Marathi) or type in English"
            className="w-full border-2 border-gray-200 focus:border-saffron rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-colors"
          />
          {/* Mic button */}
          <button
            onClick={handleMic}
            title="Click to speak"
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${listening ? 'bg-red-500 animate-pulse' : 'bg-saffron hover:bg-orange-500'}`}
          >
            <span className="text-white text-sm">{listening ? '⏹' : '🎤'}</span>
          </button>
        </div>
        <button
          onClick={() => handleQuery()}
          disabled={loading || !query.trim()}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <SpinnerIcon size={16} color="white" />
            : <SearchIcon  size={16} color="white" />
          }
          Ask
        </button>
      </div>

      {/* Example queries */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => handleExample(q)}
              className="text-xs bg-gray-100 hover:bg-saffron/10 hover:border-saffron text-gray-600 hover:text-saffron border border-gray-200 px-3 py-1.5 rounded-full transition-all">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SpinnerIcon size={16} color="#FF9933" /> Processing query…
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3 border-t pt-4">
          {/* Interpreted */}
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">🗣️</span>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interpreted: </span>
              <span className="text-sm text-gray-700 font-medium">{result.interpreted}</span>
            </div>
          </div>
          {/* Answer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
            <span className="text-lg flex-shrink-0">📊</span>
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide block mb-1">Answer</span>
              <p className="text-sm text-blue-800 font-medium leading-relaxed">{result.answer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
