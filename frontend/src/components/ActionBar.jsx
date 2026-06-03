/**
 * ActionBar.jsx
 * =============
 * Bottom sticky bar with Clear, Print, and Save actions.
 */

import { useState } from 'react'
import { Eraser, Printer, Save, CheckCircle2 } from 'lucide-react'

export default function ActionBar({ form, patient, transcript, onClear }) {
  const [toast, setToast] = useState(null)

  const handlePrint = () => window.print()

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umid: patient?.umid || '',
          transcript,
          complaints: form.complaints,
          diagnosis: form.diagnosis,
          medicines: form.medicines,
          labs: form.labs,
          notes: form.notes,
        }),
      })
      if (!response.ok) throw new Error('Save failed')
      const data = await response.json()
      showToast('success', `Record saved (Local DB) · ID #${data.id}`)
    } catch (e) {
      showToast('error', 'Could not save to backend. Save the form manually.')
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg text-sm font-medium border
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
