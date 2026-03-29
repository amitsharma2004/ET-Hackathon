import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard       from './pages/Dashboard'
import PropertyAnalysis from './pages/PropertyAnalysis'
import SatelliteView   from './pages/SatelliteView'
import Reports         from './pages/Reports'
import { ShieldIcon, ZoneIcon } from './components/icons'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://4shh3k1g.run.complete.dev'

const PAGE_TITLE = {
  English: 'RevenueGuard AI — Municipal Revenue Protection',
  'हिंदी': 'RevenueGuard AI — नगरपालिका राजस्व संरक्षण',
  'मराठी': 'RevenueGuard AI — महानगरपालिका महसूल संरक्षण',
}

export default function App() {
  const [zone,      setZone]      = useState('All Zones')
  const [lang,      setLang]      = useState('English')
  const [backendOk, setBackendOk] = useState(false)

  useEffect(() => {
    axios.get(`${BACKEND}/health`, { timeout: 4000 })
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bglight">
        <Sidebar
          zone={zone} setZone={setZone}
          lang={lang} setLang={setLang}
          backendOk={backendOk}
        />

        <main className="flex-1 flex flex-col overflow-auto">
          {/* Header */}
          <header className="bg-gradient-to-r from-navy to-blue-900 text-white px-8 py-4 shadow-lg border-b-4 border-saffron">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldIcon size={28} color="#FF9933" />
                <div>
                  <h1 className="text-lg font-extrabold text-saffron leading-tight">
                    {PAGE_TITLE[lang] || PAGE_TITLE['English']}
                  </h1>
                  <p className="text-gray-300 text-xs mt-0.5">
                    Powered by Multi-Agent GenAI &nbsp;|&nbsp; Prithvi-EO-2.0 Satellite &nbsp;|&nbsp; Pune Municipal Corporation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="bg-saffron/20 text-saffron px-3 py-1 rounded-full text-xs font-semibold">
                  🏆 Hackathon 2024
                </span>
                <span className="text-gray-400 text-xs hidden md:flex items-center gap-1">
                  <ZoneIcon size={12} color="#9ca3af" />
                  <strong className="text-white">{zone}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/"          element={<Dashboard        zone={zone} lang={lang} />} />
              <Route path="/analysis"  element={<PropertyAnalysis zone={zone} lang={lang} />} />
              <Route path="/satellite" element={<SatelliteView    zone={zone} lang={lang} />} />
              <Route path="/reports"   element={<Reports          zone={zone} lang={lang} />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-8 py-3 text-center text-xs text-gray-400">
            RevenueGuard AI &nbsp;|&nbsp; Multi-Agent GenAI for Indian ULBs &nbsp;|&nbsp;
            Ref: Jabalpur ₹30Cr Recovery &nbsp;|&nbsp; Bengaluru 30% Water Loss Reduction
          </footer>
        </main>
      </div>
    </BrowserRouter>
  )
}
