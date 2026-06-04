/**
 * Bottom bar with Clear / Print / Save buttons.
 */

import { useState, useEffect } from 'react'
import { Eraser, Printer, Save, CheckCircle2 } from 'lucide-react'

export default function ActionBar({ form, patient, transcript, onClear, saveRef }) {
  const [toast, setToast] = useState(null)

  const handlePrint = () => window.print()

  const handleSave = () => {
    try {
      // Persist to browser localStorage so records survive page reloads
      const STORAGE_KEY = 'cris-hmis-encounters'
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const record = {
        id: existing.length + 1,
        umid: patient?.umid || '',
        patient_name: patient?.name || '',
        transcript,
        complaints: form.complaints,
        diagnosis: form.diagnosis,
        medicines: form.medicines,
        labs: form.labs,
        notes: form.notes,
        created_at: new Date().toISOString(),
      }
      existing.push(record)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
      showToast('success', `Record saved (Local Storage) · ID #${record.id}`)
    } catch (e) {
      showToast('error', 'Could not save record. Storage may be full.')
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // Expose save handler so global keyboard shortcuts can invoke it
  useEffect(() => {
    if (saveRef) saveRef.current = handleSave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <>
      <div className="no-print border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-end gap-2">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 border border-rose-300 rounded-md hover:bg-rose-50"
        >
          <Eraser className="w-4 h-4" />
          Clear Form
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy-dark rounded-md"
        >
          <Printer className="w-4 h-4" />
          Generate PDF / Print
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
        >
          <Save className="w-4 h-4" />
          Save to HMIS
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg text-sm font-medium border animate-slide-up
            ${toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'}
          `}
        >
          <CheckCircle2 className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </>
  )
}
