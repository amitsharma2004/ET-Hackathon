import { useState } from 'react'
import { WhatsAppIcon, SendIcon } from './icons'

/* ── Multilingual templates ─────────────────────────────────────────────── */
const buildMessage = (propInfo, revenue, lang) => {
  const pid     = propInfo?.property_id  ?? 'N/A'
  const owner   = propInfo?.owner_name   ?? 'N/A'
  const zone    = propInfo?.zone         ?? 'N/A'
  const address = propInfo?.address?.slice(0, 40) ?? 'N/A'
  const loss    = Number(revenue?.annual_loss || 0).toLocaleString('en-IN')

  const issues = [
    revenue?.annual_loss > 0 && 'Illegal extension detected',
    'Commercial water usage',
  ].filter(Boolean)

  if (lang === 'मराठी') {
    return {
      title:  '🚨 RevenueGuard अलर्ट',
      body:
`मालमत्ता क्र.: ${pid}
मालक: ${owner}
झोन: ${zone}

आढळलेल्या समस्या:
• मालमत्तेत अनधिकृत बांधकाम
• व्यावसायिक पाणी वापर

महसूल तूट: ₹${loss}/वर्ष

कृपया ७ दिवसांत पंचनामा करा.
अन्यथा दंडात्मक कारवाई होईल.`,
      sub: 'मालमत्तेत अनधिकृत बांधकाम आढळले आहे. कृपया ७ दिवसांत पंचनामा करा.',
    }
  }
  if (lang === 'हिंदी') {
    return {
      title: '🚨 RevenueGuard अलर्ट',
      body:
`संपत्ति: ${pid}
मालिक: ${owner}
क्षेत्र: ${zone}

पाई गई समस्याएं:
• अवैध निर्माण ${issues[0] ? 'पाया गया' : ''}
• व्यावसायिक जल उपयोग

राजस्व हानि: ₹${loss}/वर्ष

7 दिनों में नोटिस का जवाब दें.
अन्यथा दंड के साथ वसूली की जाएगी.`,
      sub: 'अवैध निर्माण पाया गया। कृपया 7 दिनों में जवाब दें।',
    }
  }
  // Default English
  return {
    title: '🚨 RevenueGuard Alert',
    body:
`Property: ${pid}
Owner: ${owner}
Zone: ${zone}
Address: ${address}…

Issues Found:
• Illegal extension detected
• Commercial water usage

Revenue Loss: ₹${loss}/year

Action: Issue notice within 7 days.
Non-compliance will attract penalty.`,
    sub: '',
  }
}

const LANGS = ['English', 'मराठी', 'हिंदी']

export default function NotificationPreview({ propInfo, revenueImpact, correlationPriority }) {
  const [lang,    setLang]    = useState('English')
  const [sent,    setSent]    = useState(null)
  const [printed, setPrinted] = useState(false)

  if (!propInfo) return null

  const msg  = buildMessage(propInfo, revenueImpact, lang)
  const pid  = propInfo.property_id ?? 'N/A'
  const loss = Number(revenueImpact?.annual_loss || 0).toLocaleString('en-IN')

  const handleSend = channel => {
    setSent(channel)
    setTimeout(() => setSent(null), 3000)
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-md space-y-5">
      <h3 className="section-title">
        <WhatsAppIcon size={17} color="#25D366" /> Notification Preview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ── Phone mockup ────────────────────────────────────────────────── */}
        <div className="flex justify-center">
          <div className="w-64 rounded-3xl border-4 border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
            {/* Status bar */}
            <div className="bg-gray-900 px-4 py-1.5 flex justify-between text-gray-400 text-xs">
              <span>9:41</span>
              <span>▐▐▐ ● ⬤</span>
            </div>

            {/* WhatsApp header */}
            <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2">
              <div className="w-7 h-7 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">RG</span>
              </div>
              <div>
                <div className="text-white text-xs font-semibold">RevenueGuard AI</div>
                <div className="text-green-300 text-xs">Municipal Alert System</div>
              </div>
            </div>

            {/* Chat area */}
            <div className="bg-[#ECE5DD] px-2 py-3 min-h-48 space-y-2">
              {/* Timestamp */}
              <div className="text-center text-gray-500 text-xs bg-white/60 rounded-full px-3 py-0.5 w-fit mx-auto">
                Today
              </div>

              {/* Message bubble */}
              <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 shadow-sm max-w-full">
                <p className="text-xs font-bold text-[#075E54] mb-1">{msg.title}</p>
                <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap font-sans">
                  {msg.body}
                </p>
                {/* Priority badge */}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${correlationPriority === 'Critical' || correlationPriority === 'High Priority'
                      ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {correlationPriority ?? 'High Priority'}
                  </span>
                  <span className="text-gray-400 text-xs">✓✓</span>
                </div>
                {/* Action buttons in bubble */}
                <div className="flex gap-1.5 mt-2.5">
                  <button className="flex-1 text-xs bg-[#25D366] text-white rounded-lg py-1 font-semibold">View</button>
                  <button className="flex-1 text-xs border border-gray-300 text-gray-600 rounded-lg py-1 font-semibold">Resolve</button>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-1.5">
              <div className="flex-1 bg-white rounded-full px-3 py-1 text-xs text-gray-400">Type a message</div>
              <div className="w-7 h-7 bg-[#25D366] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">➤</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Language selector + translation ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Language tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Message Language
            </label>
            <div className="flex gap-2 flex-wrap">
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${lang === l ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy/30 hover:bg-navy/5'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Translation preview (only for non-English) */}
          {lang !== 'English' && msg.sub && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Translation Preview:</p>
              <p className="text-sm text-amber-800 font-sans leading-relaxed">{msg.sub}</p>
            </div>
          )}

          {/* Property summary */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Property</span><span className="font-semibold">{pid}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Owner</span><span className="font-semibold">{propInfo.owner_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Revenue Loss</span><span className="font-bold text-danger">₹{loss}/year</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Priority</span>
              <span className="font-bold text-orange-600">{correlationPriority ?? 'High Priority'}</span>
            </div>
          </div>

          {/* Send buttons */}
          {sent && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-xs font-medium">
              ✅ {sent} sent successfully!
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button onClick={() => handleSend('WhatsApp alert')}
              className="flex items-center gap-2 justify-center bg-[#25D366] hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-md">
              <WhatsAppIcon size={16} color="white" /> Send WhatsApp
            </button>
            <button onClick={() => handleSend('Email')}
              className="flex items-center gap-2 justify-center btn-secondary text-sm">
              <SendIcon size={14} color="white" /> Send Email
            </button>
            <button onClick={() => { setPrinted(true); setTimeout(() => setPrinted(false), 2000) }}
              className={`flex items-center gap-2 justify-center border-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all
                ${printed ? 'border-green-500 text-green-600 bg-green-50' : 'border-navy text-navy hover:bg-navy/5'}`}>
              🖨️ {printed ? 'Sending to printer…' : 'Print Notice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
