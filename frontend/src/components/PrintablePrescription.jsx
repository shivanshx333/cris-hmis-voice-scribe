/**
 * Hidden A4 layout that appears only when printing.
 */

export default function PrintablePrescription({ form, patient }) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="print-only">
      <div style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', background: '#fff', color: '#000', fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #003366', paddingBottom: '8mm', marginBottom: '8mm' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#003366', letterSpacing: '0.5px' }}>
              CRIS HOSPITAL MANAGEMENT SYSTEM
            </div>
            <div style={{ fontSize: '10pt', marginTop: '2mm', color: '#475569' }}>
              Centre for Railway Information Systems · Ministry of Railways, Government of India
            </div>
            <div style={{ fontSize: '9pt', marginTop: '1mm', color: '#64748b' }}>
              Railway Medical Services Division · New Delhi
            </div>
          </div>
        </div>

        {/* Patient demographics */}
        <table style={{ width: '100%', fontSize: '10pt', marginBottom: '6mm', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '2mm 0', width: '15%', fontWeight: 600 }}>Name:</td>
              <td style={{ padding: '2mm 0', width: '35%' }}>{patient?.name || '—'}</td>
              <td style={{ padding: '2mm 0', width: '15%', fontWeight: 600 }}>UMID:</td>
              <td style={{ padding: '2mm 0', width: '35%' }}>{patient?.umid || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '2mm 0', fontWeight: 600 }}>Age/Sex:</td>
              <td style={{ padding: '2mm 0' }}>{patient ? `${patient.age}Y / ${patient.sex}` : '—'}</td>
              <td style={{ padding: '2mm 0', fontWeight: 600 }}>Date:</td>
              <td style={{ padding: '2mm 0' }}>{today}</td>
            </tr>
            <tr>
              <td style={{ padding: '2mm 0', fontWeight: 600 }}>Designation:</td>
              <td style={{ padding: '2mm 0' }} colSpan={3}>
                {patient ? `${patient.designation} · ${patient.unit}` : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Sections */}
        <Section title="Chief Complaints" content={form.complaints} />
        <Section title="Diagnosis" content={form.diagnosis} />

        {form.medicines.length > 0 && (
          <div style={{ marginBottom: '6mm' }}>
            <div style={{ background: '#003366', color: '#fff', padding: '2mm 3mm', fontSize: '10pt', fontWeight: 600 }}>
              Rx — MEDICATIONS
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={th}>#</th>
                  <th style={{ ...th, textAlign: 'left' }}>Medicine</th>
                  <th style={th}>Dosage</th>
                  <th style={th}>Frequency</th>
                  <th style={th}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {form.medicines.map((m, i) => (
                  <tr key={i}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, textAlign: 'left' }}>{m.name}</td>
                    <td style={td}>{m.dosage || '—'}</td>
                    <td style={td}>{m.frequency || '—'}</td>
                    <td style={td}>{m.duration || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {form.labs.length > 0 && (
          <Section title="Investigations" content={form.labs.join(', ')} />
        )}

        <Section title="Advisory / Notes" content={form.notes} />

        {/* Signature */}
        <div style={{ marginTop: '20mm', borderTop: '1px solid #94a3b8', paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
          <div>
            <div>Generated via CRIS HMIS Voice Scribe</div>
            <div style={{ marginTop: '1mm', color: '#64748b' }}>Document is system-generated</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '1mm', minWidth: '60mm' }}>
              Doctor's Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const th = {
  border: '1px solid #cbd5e1',
  padding: '2mm 3mm',
  fontSize: '9pt',
  fontWeight: 600,
  textAlign: 'center',
}

const td = {
  border: '1px solid #cbd5e1',
  padding: '2mm 3mm',
  fontSize: '9.5pt',
  textAlign: 'center',
}

function Section({ title, content }) {
  if (!content) return null
  return (
    <div style={{ marginBottom: '6mm' }}>
      <div style={{ background: '#003366', color: '#fff', padding: '2mm 3mm', fontSize: '10pt', fontWeight: 600 }}>
        {title.toUpperCase()}
      </div>
      <div style={{ padding: '3mm', border: '1px solid #cbd5e1', borderTop: 'none', fontSize: '10pt', minHeight: '8mm' }}>
        {content}
      </div>
    </div>
  )
}
