/**
 * Top header bar: clock, history drawer, shortcuts, user info.
 */

import { useEffect, useState, useRef } from 'react'
import {
  ShieldCheck, User, Clock, History, Keyboard, X, FileText, ChevronRight,
} from 'lucide-react'

export default function Header() {
  const [now, setNow] = useState(new Date())
  const [historyOpen, setHistoryOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [encounters, setEncounters] = useState([])

  // Live clock — updates every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Refresh history when drawer opens (reads from localStorage)
  useEffect(() => {
    if (historyOpen) {
      const raw = localStorage.getItem('cris-hmis-encounters') || '[]'
      try {
        setEncounters(JSON.parse(raw).slice().reverse())
      } catch (e) {
        setEncounters([])
      }
    }
  }, [historyOpen])

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: false })

  return (
    <>
      <header className="no-print bg-navy text-white relative z-30">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-navy rounded-sm flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
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

          {/* Right-side controls */}
          <div className="flex items-center gap-2">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-navy-dark rounded-sm border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              <div className="text-[11px] leading-tight">
                <div className="font-mono font-semibold">{timeStr}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">{dateStr}</div>
              </div>
            </div>

            {/* History */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-dark hover:bg-navy-light rounded-sm border border-slate-700 transition-colors"
              title="Recent encounters"
            >
              <History className="w-4 h-4" />
              <span className="text-xs font-medium">History</span>
            </button>

            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setShortcutsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-dark hover:bg-navy-light rounded-sm border border-slate-700 transition-colors"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Session indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-dark rounded-sm border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">Secure</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-dark rounded-sm border border-slate-700">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Dr. User &middot; RMO</span>
            </div>
          </div>
        </div>
        {/* Rail-line accent */}
        <div className="h-1 bg-gradient-to-r from-rail via-slate-400 to-rail" />
      </header>

      {/* History Drawer */}
      {historyOpen && (
        <HistoryDrawer
          encounters={encounters}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {/* Shortcuts Modal */}
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </>
  )
}

// --------------------------------------------------------------------------
// History Drawer
// --------------------------------------------------------------------------
function HistoryDrawer({ encounters, onClose }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-slide-in">
        <div className="bg-navy text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <h2 className="text-sm font-bold tracking-wider uppercase">Encounter History</h2>
          </div>
          <button onClick={onClose} className="hover:text-rose-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 text-xs text-slate-600">
          {encounters.length} {encounters.length === 1 ? 'record' : 'records'} saved in this session
        </div>
        <div className="flex-1 overflow-y-auto panel-scroll">
          {encounters.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              No saved encounters yet.
              <div className="text-xs mt-2 text-slate-400">
                Save a record to see it here.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {encounters.map((rec) => (
                <li key={rec.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                        #{rec.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {rec.patient_name || 'Unknown patient'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mb-1.5">
                    {rec.umid || '—'} &middot;{' '}
                    {new Date(rec.created_at).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  {rec.diagnosis && (
                    <div className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                      <span className="text-slate-500 font-semibold">Dx:</span> {rec.diagnosis}
                    </div>
                  )}
                  {rec.medicines?.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      {rec.medicines.length} medicine(s) prescribed
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

// --------------------------------------------------------------------------
// Keyboard Shortcuts Modal
// --------------------------------------------------------------------------
function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys: ['Space'], label: 'Toggle voice recording' },
    { keys: ['Enter'], label: 'Process transcript (when in textarea)' },
    { keys: ['Ctrl', 'S'], label: 'Save to HMIS' },
    { keys: ['Ctrl', 'P'], label: 'Print prescription' },
    { keys: ['Ctrl', 'K'], label: 'Focus patient search' },
    { keys: ['Esc'], label: 'Close dialogs' },
  ]
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in"
        >
          <div className="bg-navy text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wider uppercase">Keyboard Shortcuts</h2>
            </div>
            <button onClick={onClose} className="hover:text-rose-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">
            <ul className="space-y-2">
              {shortcuts.map((s) => (
                <li
                  key={s.label}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 border border-slate-300 text-slate-700 rounded shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
