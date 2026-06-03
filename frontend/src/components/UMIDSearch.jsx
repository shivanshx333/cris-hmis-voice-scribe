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
    let filtered = []

    // Try backend first
    fetch(`/api/patients?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setResults(data))
      .catch(() => {
        // Fallback to local mock data
        filtered = MOCK_PATIENTS.filter(
          (p) =>
            p.umid.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
        )
        setResults(filtered)
      })
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
        <div className="mt-3 p-3 border border-navy/20 bg-navy/5 rounded-md">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-navy" />
              <span className="text-sm font-bold text-navy">{patient.name}</span>
            </div>
            <button
              onClick={clearPatient}
              className="text-slate-400 hover:text-rose-600"
              title="Clear patient"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
            <div>
              <span className="text-slate-500">UMID:</span>{' '}
              <span className="font-mono text-slate-800">{patient.umid}</span>
            </div>
            <div>
              <span className="text-slate-500">Age/Sex:</span>{' '}
              <span className="text-slate-800">{patient.age}Y / {patient.sex}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Designation:</span>{' '}
              <span className="text-slate-800">{patient.designation}</span>
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
