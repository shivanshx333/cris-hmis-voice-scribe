/**
 * mockExtract.js
 * ==============
 * Offline fallback extraction. Returns mock structured data based on
 * keyword matching when the backend API is unreachable.
 */

export function mockExtract(transcript) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const t = transcript.toLowerCase()

      if (t.includes('fever') || t.includes('cough')) {
        resolve({
          complaints: 'Fever, Cough',
          diagnosis: 'Viral Upper Respiratory Infection',
          medicines: [
            { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', duration: '5 days' },
            { name: 'Cetirizine 10mg', dosage: '10mg', frequency: '0-0-1', duration: '5 days' },
          ],
          labs: ['CBC', 'MP'],
          notes: 'Adequate rest, oral fluids. Review in 5 days if symptoms persist.',
        })
        return
      }

      if (t.includes('chest pain') || t.includes('bp') || t.includes('blood pressure')) {
        resolve({
          complaints: 'Chest Pain',
          diagnosis: 'Hypertension / Angina Evaluation',
          medicines: [
            { name: 'Amlodipine 5mg', dosage: '5mg', frequency: '0-0-1', duration: '10 days' },
            { name: 'Aspirin 75mg', dosage: '75mg', frequency: '1-0-0', duration: '10 days' },
          ],
          labs: ['ECG', 'Lipid Profile', 'TMT'],
          notes: 'Cardiology follow-up. Avoid strenuous activity until cleared.',
        })
        return
      }

      if (t.includes('diabetes') || t.includes('sugar')) {
        resolve({
          complaints: 'Increased thirst, fatigue',
          diagnosis: 'Type 2 Diabetes Mellitus — follow-up',
          medicines: [
            { name: 'Metformin 500mg', dosage: '500mg', frequency: '1-0-1', duration: '30 days' },
          ],
          labs: ['HbA1c', 'FBS', 'PPBS', 'KFT'],
          notes: 'Diabetic diet, daily 30-min walk. Review monthly.',
        })
        return
      }

      // Default: generic structure
      resolve({
        complaints: transcript.length > 80 ? transcript.slice(0, 80) + '...' : transcript,
        diagnosis: 'General consultation',
        medicines: [],
        labs: [],
        notes: 'Symptomatic management. Review in 7 days.',
      })
    }, 800)
  })
}
