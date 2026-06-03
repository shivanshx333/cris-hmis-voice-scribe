/**
 * App.jsx
 * =======
 * Root component for CRIS HMIS Voice Scribe.
 * Renders the enterprise header and the split-screen Dashboard.
 */

import { useState } from 'react'
import { ShieldCheck, User } from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Top Enterprise Header */}
      <header className="no-print bg-navy text-white">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-navy rounded-sm flex items-center justify-center font-bold text-xs tracking-wider">
              CRIS
            </div>
            <div>
              <div className="text-base font-bold tracking-wide leading-tight">
                CRIS HMIS VOICE SCRIBE
              </div>
              <div className="text-[10px] text-slate-300 tracking-wider uppercase">
                Centre for Railway Information Systems · Ministry of Railways
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-dark rounded-sm border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">Secure Session</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-dark rounded-sm border border-slate-700">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Dr. User &middot; RMO</span>
            </div>
          </div>
        </div>
        {/* Rail-line accent */}
        <div className="h-1 bg-gradient-to-r from-rail via-slate-400 to-rail" />
      </header>

      {/* Main Dashboard */}
      <Dashboard />
    </div>
  )
}
