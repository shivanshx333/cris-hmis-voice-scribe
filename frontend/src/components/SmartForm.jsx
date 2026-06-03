/**
 * SmartForm.jsx
 * =============
 * Editable structured form with section headers.
 * Maps the AI extraction output and flashes auto-filled fields.
 */

import { Trash2, Plus, X } from 'lucide-react'

function SectionHeader({ children }) {
  return (
    <div className="bg-navy text-white px-3 py-1.5 rounded-t-md">
      <span className="text-[11px] font-bold tracking-wider uppercase">{children}</span>
    </div>
  )
}

function flashClass(flag) {
  return flag ? 'flash-highlight' : ''
}

export default function SmartForm({ form, setForm, flashFields }) {
  // ----------------------------------------------------------------------
  // Field updaters
  // ----------------------------------------------------------------------
  const update = (key, value) => setForm({ ...form, [key]: value })

  const updateMedicine = (idx, key, value) => {
    const medicines = [...form.medicines]
    medicines[idx] = { ...medicines[idx], [key]: value }
    setForm({ ...form, medicines })
  }

  const addMedicineRow = () => {
    setForm({
      ...form,
      medicines: [...form.medicines, { name: '', dosage: '', frequency: '', duration: '' }],
    })
  }

  const removeMedicine = (idx) => {
    setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) })
  }

  const removeLab = (lab) => {
    setForm({ ...form, labs: form.labs.filter((l) => l !== lab) })
  }

  const addLab = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newLab = e.target.value.trim()
      if (!form.labs.includes(newLab)) {
        setForm({ ...form, labs: [...form.labs, newLab] })
      }
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Chief Complaints */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <SectionHeader>Chief Complaints</SectionHeader>
        <div className={`p-3 ${flashClass(flashFields.complaints)}`}>
          <textarea
            value={form.complaints}
            onChange={(e) => update('complaints', e.target.value)}
            placeholder="e.g., Fever, cough for 3 days; chest tightness"
            className="w-full min-h-[70px] p-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-y"
          />
        </div>
      </div>

      {/* Diagnosis */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <SectionHeader>Diagnosis</SectionHeader>
        <div className={`p-3 ${flashClass(flashFields.diagnosis)}`}>
          <textarea
            value={form.diagnosis}
            onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="e.g., Viral Upper Respiratory Infection"
            className="w-full min-h-[60px] p-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-y"
          />
        </div>
      </div>

      {/* Medicines */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <SectionHeader>Medicines</SectionHeader>
        <div className={`p-3 ${flashClass(flashFields.medicines)}`}>
          {form.medicines.length === 0 ? (
            <div className="text-xs italic text-slate-400 py-2 text-center">
              No medicines added. Use voice dictation or click "Add Row" below.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="text-left pb-2 pr-2 font-semibold">Medicine Name</th>
                    <th className="text-left pb-2 px-2 font-semibold w-20">Dosage</th>
                    <th className="text-left pb-2 px-2 font-semibold w-24">Frequency</th>
                    <th className="text-left pb-2 px-2 font-semibold w-24">Duration</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.medicines.map((med, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                          placeholder="Paracetamol 500mg"
                          className="w-full p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                          placeholder="500mg"
                          className="w-full p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                          placeholder="1-0-1"
                          className="w-full p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                          placeholder="5 days"
                          className="w-full p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="py-1.5 text-center">
                        <button
                          onClick={() => removeMedicine(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            onClick={addMedicineRow}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-navy-dark"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
        </div>
      </div>

      {/* Lab Tests / Investigations */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <SectionHeader>Lab Tests / Investigations</SectionHeader>
        <div className={`p-3 ${flashClass(flashFields.labs)}`}>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
            {form.labs.length === 0 ? (
              <span className="text-xs italic text-slate-400">No tests added yet.</span>
            ) : (
              form.labs.map((lab) => (
                <span
                  key={lab}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-800 text-xs rounded-full"
                >
                  {lab}
                  <button
                    onClick={() => removeLab(lab)}
                    className="hover:text-rose-600"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <input
            type="text"
            onKeyDown={addLab}
            placeholder="Type a test and press Enter (e.g., CBC, ECG, Lipid Profile)"
            className="w-full p-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
          />
        </div>
      </div>

      {/* Advisory / Notes */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <SectionHeader>Advisory / Notes</SectionHeader>
        <div className={`p-3 ${flashClass(flashFields.notes)}`}>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="e.g., Adequate rest, oral fluids. Review in 5 days."
            className="w-full min-h-[70px] p-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-y"
          />
        </div>
      </div>
    </div>
  )
}
