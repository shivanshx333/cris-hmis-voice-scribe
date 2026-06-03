/**
 * Dashboard.jsx
 * =============
 * Split-screen layout with global keyboard shortcuts and form progress.
 */

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import UMIDSearch from './UMIDSearch.jsx'
import DictationHub from './DictationHub.jsx'
import SmartForm from './SmartForm.jsx'
import ActionBar from './ActionBar.jsx'
import PrintablePrescription from './PrintablePrescription.jsx'

const EMPTY_FORM = {
  complaints: '',
  diagnosis: '',
  medicines: [],
  labs: [],
  notes: '',
}

export default function Dashboard() {
  const [patient, setPatient] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [flashFields, setFlashFields] = useState({})
  const [recordTrigger, setRecordTrigger] = useState(undefined)
  const saveRef = useRef(null)

  // Form completion: 5 sections
  const filled = [
    !!form.complaints.trim(),
    !!form.diagnosis.trim(),
    form.medicines.length > 0,
    form.labs.length > 0,
    !!form.notes.trim(),
  ]
  const completion = Math.round((filled.filter(Boolean).length / filled.length) * 100)

  const triggerFlash = (fields) => {
    const flash = {}
    fields.forEach((f) => (flash[f] = true))
    setFlashFields(flash)
    setTimeout(() => setFlashFields({}), 1300)
  }

  const handleExtracted = (data) => {
    setForm({
      complaints: data.complaints || '',
      diagnosis: data.diagnosis || '',
      medicines: data.medicines || [],
      labs: data.labs || [],
      notes: data.notes || '',
    })
    const changed = []
    if (data.complaints) changed.push('complaints')
    if (data.diagnosis) changed.push('diagnosis')
    if (data.medicines?.length) changed.push('medicines')
    if (data.labs?.length) changed.push('labs')
    if (data.notes) changed.push('notes')
    triggerFlash(changed)
  }

  const handleClear = () => {
    setForm(EMPTY_FORM)
    setTranscript('')
  }

  // ----------------------------------------------------------------------
  // Global keyboard shortcuts
  // ----------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      // Ignore shortcuts while typing in a text field
      const inField = ['INPUT', 'TEXTAREA'].includes(e.target.tagName)

      // Ctrl+S → Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveRef.current?.()
        return
      }
      // Ctrl+P → Print (browser default works, but ensure form has data)
      // Don't intercept — let browser handle

      // Ctrl+K → focus patient search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.querySelector('input[placeholder*="UMID"]')?.focus()
        return
      }

      // Space → toggle mic (only when not in a field)
      if (e.code === 'Space' && !inField) {
        e.preventDefault()
        setRecordTrigger((v) => (v === undefined ? 0 : v + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <main className="flex flex-1 overflow-hidden no-print">
        {/* LEFT PANEL */}
        <aside className="w-2/5 min-w-[380px] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-wider uppercase text-navy">
              Patient Context
            </div>
            <kbd className="text-[9px] font-mono text-slate-500 bg-white border border-slate-300 px-1.5 py-0.5 rounded">
              Ctrl + K
            </kbd>
          </div>
          <div className="p-5 border-b border-slate-200">
            <UMIDSearch patient={patient} setPatient={setPatient} />
          </div>
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-wider uppercase text-navy">
              Voice Dictation Hub
            </div>
            <kbd className="text-[9px] font-mono text-slate-500 bg-white border border-slate-300 px-1.5 py-0.5 rounded">
              Space
            </kbd>
          </div>
          <div className="flex-1 overflow-y-auto panel-scroll p-5">
            <DictationHub
              transcript={transcript}
              setTranscript={setTranscript}
              onExtracted={handleExtracted}
              recordTrigger={recordTrigger}
            />
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* Form completion strip */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-navy">
                Medical Encounter Form
              </span>
              <div className="flex items-center gap-1">
                {filled.map((f, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      f ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-600">
                {completion}% complete
              </span>
              {completion === 100 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto panel-scroll px-6 py-5">
            <SmartForm form={form} setForm={setForm} flashFields={flashFields} />
          </div>
          <ActionBar
            form={form}
            patient={patient}
            transcript={transcript}
            onClear={handleClear}
            saveRef={saveRef}
          />
        </section>
      </main>

      <PrintablePrescription form={form} patient={patient} />
    </>
  )
}
