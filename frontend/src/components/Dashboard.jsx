/**
 * Dashboard.jsx
 * =============
 * Split-screen layout: left panel for patient context + dictation,
 * right panel for the smart form + action bar.
 */

import { useState } from 'react'
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

  // Triggered after extraction — flash fields green for 1.2s
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

  return (
    <>
      <main className="flex flex-1 overflow-hidden no-print">
        {/* LEFT PANEL: 40% — Patient Context + Dictation */}
        <aside className="w-2/5 min-w-[380px] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-[11px] font-bold tracking-wider uppercase text-navy">
              Patient Context
            </div>
          </div>
          <div className="p-5 border-b border-slate-200">
            <UMIDSearch patient={patient} setPatient={setPatient} />
          </div>
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-[11px] font-bold tracking-wider uppercase text-navy">
              Voice Dictation Hub
            </div>
          </div>
          <div className="flex-1 overflow-y-auto panel-scroll p-5">
            <DictationHub
              transcript={transcript}
              setTranscript={setTranscript}
              onExtracted={handleExtracted}
            />
          </div>
        </aside>

        {/* RIGHT PANEL: 60% — Smart Form + Action Bar */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto panel-scroll px-6 py-5">
            <SmartForm form={form} setForm={setForm} flashFields={flashFields} />
          </div>
          <ActionBar
            form={form}
            patient={patient}
            transcript={transcript}
            onClear={handleClear}
          />
        </section>
      </main>

      {/* Hidden printable layout */}
      <PrintablePrescription form={form} patient={patient} />
    </>
  )
}
