/**
 * UMIDSearch.jsx
 * ==============
 * Patient lookup by UMID with autocomplete and selectable cards.
 */

import { useState, useEffect } from 'react'
import { Search, X, BadgeCheck } from 'lucide-react'

const MOCK_PATIENTS = [
  { umid: 'RLY-2024-001', name: 'Rajesh Kumar', age: 45, sex: 'M',
    designation: 'Loco Pilot', unit: 'Diesel Shed Patiala' },
  { umid: 'RLY-2024-002', name: 'Sunita Devi', age: 38, sex: 'F',
    designation: 'Station Master', unit: 'New Delhi' },
  { umid: 'RLY-2024-003', name: 'Amit Sharma', age: 52, sex: 'M',
    designation: 'Track Maintainer', unit: 'Delhi Division' },
  { umid: 'RLY-2024-004', name: 'Priya Singh', age: 29, sex: 'F',
    designation: 'Ticket Examiner', unit: 'Mumbai Central' },
]

export default function UMIDSearch({ patient, setPatient }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    setResults(
      MOCK_PATIENTS.filter(
        (p) =>
          p.umid.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      )
    )
  }, [query])

  const selectPatient = (p) => {
    setPatient(p)
    setQuery('')
    setShowDropdown(false)
  }

  const clearPatient = () => setPatient(null)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Enter UMID / Patient ID"
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy bg-white"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.umid}
              onClick={() => selectPatient(p)}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{p.umid}</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {p.age}Y · {p.sex} · {p.designation} · {p.unit}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected patient card */}
      {patient && (
        <div className="mt-3 p-3 border border-navy/20 bg-gradient-to-br from-navy/5 to-navy/10 rounded-md animate-fade-in">
          <div className="flex items-start gap-3">
            {/* Avatar with initials */}
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${
                patient.sex === 'F' ? 'bg-rose-500' : 'bg-navy'
              }`}
            >
              {patient.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BadgeCheck className="w-4 h-4 text-navy flex-shrink-0" />
                  <span className="text-sm font-bold text-navy truncate">{patient.name}</span>
                </div>
                <button
                  onClick={clearPatient}
                  className="text-slate-400 hover:text-rose-600 flex-shrink-0"
                  title="Clear patient"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">{patient.umid}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-3 pt-3 border-t border-navy/10">
            <div>
              <span className="text-slate-500">Age/Sex:</span>{' '}
              <span className="text-slate-800 font-medium">{patient.age}Y / {patient.sex}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Active
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Role:</span>{' '}
              <span className="text-slate-800 font-medium">{patient.designation}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Unit:</span>{' '}
              <span className="text-slate-800">{patient.unit}</span>
            </div>
          </div>
        </div>
      )}

      {!patient && (
        <div className="mt-3 text-xs text-slate-400 italic">
          No patient selected. Search by UMID (try RLY-2024-001).
        </div>
      )}
    </div>
  )
}
