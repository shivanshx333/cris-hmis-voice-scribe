/**
 * extractor.js
 * ============
 * Rule-based NLP extraction. Ported from backend/extractor.py so the app
 * runs entirely in the browser with no server dependency.
 *
 * Takes a transcript string and returns:
 *   { complaints, diagnosis, medicines[], labs[], notes }
 */

// --------------------------------------------------------------------------
// Reference data
// --------------------------------------------------------------------------
const KNOWN_LABS = [
  'CBC', 'ECG', 'X-Ray', 'Chest X-Ray', 'RBS', 'FBS', 'PPBS', 'HbA1c',
  'Lipid Profile', 'LFT', 'KFT', 'RFT', 'MP', 'Widal', 'COVID-19 RTPCR',
  'Urine Routine', 'Urine RE', 'TSH', 'T3', 'T4', 'Vitamin D', 'Vitamin B12',
  'USG', 'USG Abdomen', 'CT Scan', 'MRI', 'Echo', 'TMT', 'Holter',
  'Blood Sugar', 'ESR', 'CRP', 'Dengue NS1', 'Typhidot',
]

const FREQUENCY_MAP = {
  'od': '1-0-0', 'once daily': '1-0-0', 'once a day': '1-0-0',
  'bd': '1-0-1', 'bid': '1-0-1', 'twice daily': '1-0-1', 'twice a day': '1-0-1',
  'tid': '1-1-1', 'tds': '1-1-1', 'three times a day': '1-1-1',
  'qid': '1-1-1-1', 'four times a day': '1-1-1-1',
  'hs': '0-0-1', 'at bedtime': '0-0-1', 'at night': '0-0-1',
  'sos': 'SOS', 'prn': 'SOS', 'as needed': 'SOS',
}

const COMMON_MEDS = [
  'paracetamol', 'ibuprofen', 'amoxicillin', 'azithromycin', 'amlodipine',
  'atorvastatin', 'metformin', 'pantoprazole', 'omeprazole', 'cetirizine',
  'montelukast', 'telmisartan', 'losartan', 'ramipril', 'metoprolol',
  'ciprofloxacin', 'levofloxacin', 'cefixime', 'ondansetron', 'domperidone',
  'diclofenac', 'aceclofenac', 'tramadol', 'clopidogrel', 'aspirin',
  'salbutamol', 'prednisolone', 'dexamethasone', 'insulin', 'levothyroxine',
  'crocin', 'dolo', 'calpol', 'combiflam', 'azee', 'augmentin', 'zifi',
  'pan', 'pantocid', 'nexpro', 'rabeprazole', 'telma', 'stamlo',
]

const MED_SUFFIXES = [
  'cillin', 'mycin', 'azole', 'pril', 'sartan', 'olol',
  'statin', 'dipine', 'prazole', 'floxacin',
]

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function looksLikeMedicine(word) {
  const w = word.toLowerCase()
  return MED_SUFFIXES.some((s) => w.endsWith(s))
}

function findFrequencyAlias(text, medName) {
  const idx = text.indexOf(medName)
  if (idx === -1) return ''
  const window = text.slice(idx, idx + 80)
  for (const [alias, code] of Object.entries(FREQUENCY_MAP)) {
    const re = new RegExp('\\b' + escapeRegex(alias) + '\\b', 'i')
    if (re.test(window)) return code
  }
  return ''
}

// --------------------------------------------------------------------------
// Field extractors
// --------------------------------------------------------------------------
function extractComplaints(text) {
  const patterns = [
    /(?:presenting with|presents with|complaints? of|c\/?o|chief complaints?:?-?)\s+([^.;]+?)(?:\.|;|diagnosed|diagnosis|assessment|impression|prescrib|advis|$)/i,
    /patient (?:has|is having|reports?)\s+([^.;]+?)(?:\.|;|since|for|$)/i,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) return m[1].trim().replace(/[,.]$/, '')
  }
  return ''
}

function extractDiagnosis(text) {
  const patterns = [
    /(?:diagnos(?:ed|is)(?:\s+(?:with|of|is))?|assessment:?-?|impression:?-?)\s+([^.;]+?)(?:\.|;|prescrib|advis|medicines?|tests?|labs?|$)/i,
    /likely\s+([^.;]+?)(?:\.|;|$)/i,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) return m[1].trim().replace(/[,.]$/, '')
  }
  return ''
}

function extractMedicines(text) {
  const medicines = []
  const textLower = text.toLowerCase()
  const seen = new Set()

  // Pattern: name + dosage + optional frequency-code + optional duration
  const re = /\b([a-zA-Z]{4,})\s+(\d+\s*(?:mg|ml|mcg|g))\s*(\d-\d-\d(?:-\d)?)?\s*(?:for\s+(\d+\s+(?:day|week|month)s?))?/gi
  let m
  while ((m = re.exec(text)) !== null) {
    const name = m[1]
    const nameLower = name.toLowerCase()
    if (!COMMON_MEDS.includes(nameLower) && !looksLikeMedicine(nameLower)) continue
    if (seen.has(nameLower)) continue
    seen.add(nameLower)

    const dosage = m[2] || ''
    const freq = m[3] || findFrequencyAlias(textLower, nameLower)
    const duration = m[4] || ''
    medicines.push({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + (dosage ? ' ' + dosage : ''),
      dosage,
      frequency: freq,
      duration,
    })
  }

  // Fallback: scan COMMON_MEDS by name even without explicit dosage
  if (medicines.length === 0) {
    for (const med of COMMON_MEDS) {
      if (textLower.includes(med) && !seen.has(med)) {
        const dosageRe = new RegExp(escapeRegex(med) + '\\s+(\\d+\\s*(?:mg|ml|mcg|g))', 'i')
        const durRe = new RegExp(escapeRegex(med) + '.*?for\\s+(\\d+\\s+(?:day|week|month)s?)', 'i')
        const dM = textLower.match(dosageRe)
        const durM = textLower.match(durRe)
        const display = med.charAt(0).toUpperCase() + med.slice(1) + (dM ? ' ' + dM[1] : '')
        medicines.push({
          name: display,
          dosage: dM ? dM[1] : '',
          frequency: findFrequencyAlias(textLower, med),
          duration: durM ? durM[1] : '',
        })
        seen.add(med)
      }
    }
  }

  return medicines
}

function extractLabs(text) {
  const found = []
  const textLower = text.toLowerCase()
  for (const lab of KNOWN_LABS) {
    if (textLower.includes(lab.toLowerCase()) && !found.includes(lab)) {
      found.push(lab)
    }
  }
  return found
}

function extractNotes(text) {
  const pat = /(?:advis(?:e|ed)|notes?|instruction[s]?|follow[- ]?up):?-?\s+([^.;]+?)(?:\.|;|$)/i
  const m = text.match(pat)
  return m ? m[1].trim().replace(/[,.]$/, '') : ''
}

// --------------------------------------------------------------------------
// Main entry
// --------------------------------------------------------------------------
export function extract(transcript) {
  if (!transcript) {
    return { complaints: '', diagnosis: '', medicines: [], labs: [], notes: '' }
  }
  return {
    complaints: extractComplaints(transcript),
    diagnosis: extractDiagnosis(transcript),
    medicines: extractMedicines(transcript),
    labs: extractLabs(transcript),
    notes: extractNotes(transcript),
  }
}
