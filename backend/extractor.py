"""
extractor.py
============
Rule-based NLP extraction engine.

Takes raw transcript text and extracts structured medical fields using
regex and keyword matching. Runs entirely offline — no external APIs.
"""

import re

# --------------------------------------------------------------------------
# Reference data
# --------------------------------------------------------------------------
KNOWN_LABS = [
    "CBC", "ECG", "X-Ray", "Chest X-Ray", "RBS", "FBS", "PPBS", "HbA1c",
    "Lipid Profile", "LFT", "KFT", "RFT", "MP", "Widal", "COVID-19 RTPCR",
    "Urine Routine", "Urine RE", "TSH", "T3", "T4", "Vitamin D", "Vitamin B12",
    "USG", "USG Abdomen", "CT Scan", "MRI", "Echo", "TMT", "Holter",
    "Blood Sugar", "ESR", "CRP", "Dengue NS1", "Typhidot",
]

FREQUENCY_MAP = {
    "od": "1-0-0", "once daily": "1-0-0", "once a day": "1-0-0",
    "bd": "1-0-1", "bid": "1-0-1", "twice daily": "1-0-1", "twice a day": "1-0-1",
    "tid": "1-1-1", "tds": "1-1-1", "three times a day": "1-1-1",
    "qid": "1-1-1-1", "four times a day": "1-1-1-1",
    "hs": "0-0-1", "at bedtime": "0-0-1", "at night": "0-0-1",
    "sos": "SOS", "prn": "SOS", "as needed": "SOS",
}

COMMON_MEDS = [
    "paracetamol", "ibuprofen", "amoxicillin", "azithromycin", "amlodipine",
    "atorvastatin", "metformin", "pantoprazole", "omeprazole", "cetirizine",
    "montelukast", "telmisartan", "losartan", "ramipril", "metoprolol",
    "ciprofloxacin", "levofloxacin", "cefixime", "ondansetron", "domperidone",
    "diclofenac", "aceclofenac", "tramadol", "clopidogrel", "aspirin",
    "salbutamol", "prednisolone", "dexamethasone", "insulin", "levothyroxine",
    "crocin", "dolo", "calpol", "combiflam", "azee", "augmentin", "zifi",
    "pan", "pantocid", "nexpro", "rabeprazole", "telma", "stamlo",
]


# --------------------------------------------------------------------------
# Extraction functions
# --------------------------------------------------------------------------
def extract_complaints(text):
    """Find phrases after 'presenting with', 'complaints of', 'c/o'."""
    patterns = [
        r"(?:presenting with|presents with|complaints? of|c/?o|chief complaints?[:\-]?)\s+([^.;]+?)(?:\.|;|diagnosed|diagnosis|assessment|impression|prescrib|advis|$)",
        r"patient (?:has|is having|reports?)\s+([^.;]+?)(?:\.|;|since|for|$)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip(" ,.")
    return ""


def extract_diagnosis(text):
    """Find phrases after 'diagnosed with', 'assessment', 'impression'."""
    patterns = [
        r"(?:diagnos(?:ed|is)(?:\s+(?:with|of|is))?|assessment[:\-]?|impression[:\-]?)\s+([^.;]+?)(?:\.|;|prescrib|advis|medicines?|tests?|labs?|$)",
        r"likely\s+([^.;]+?)(?:\.|;|$)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip(" ,.")
    return ""


def extract_medicines(text):
    """
    Extract medicine entries.
    Looks for: name + optional dosage + optional frequency + optional duration.
    """
    medicines = []
    text_lower = text.lower()

    # Pattern: medicine name with dosage and timing
    # e.g. "Paracetamol 500mg 1-0-1 for 5 days"
    pattern_full = re.compile(
        r"\b([a-z]{4,})\s+(\d+\s*(?:mg|ml|mcg|g))\s*(?:(\d-\d-\d(?:-\d)?))?\s*(?:for\s+(\d+\s+(?:day|week|month)s?))?",
        re.IGNORECASE,
    )

    for m in pattern_full.finditer(text):
        name = m.group(1)
        dosage = m.group(2) or ""
        freq = m.group(3) or ""
        duration = m.group(4) or ""

        # Filter out non-medicine words
        if name.lower() not in COMMON_MEDS and not _looks_like_medicine(name):
            continue

        medicines.append({
            "name": name.title() + (f" {dosage}" if dosage else ""),
            "dosage": dosage,
            "frequency": freq or _find_frequency_alias(text_lower, name.lower()),
            "duration": duration,
        })

    # Pattern: medicine name with frequency alias (BD, TID, etc.) and no explicit dosage
    if not medicines:
        for med in COMMON_MEDS:
            if med in text_lower:
                dosage_match = re.search(
                    re.escape(med) + r"\s+(\d+\s*(?:mg|ml|mcg|g))",
                    text_lower,
                )
                dur_match = re.search(
                    re.escape(med) + r".*?for\s+(\d+\s+(?:day|week|month)s?)",
                    text_lower,
                )
                medicines.append({
                    "name": med.title() + (f" {dosage_match.group(1)}"
                                           if dosage_match else ""),
                    "dosage": dosage_match.group(1) if dosage_match else "",
                    "frequency": _find_frequency_alias(text_lower, med),
                    "duration": dur_match.group(1) if dur_match else "",
                })

    return medicines


def extract_labs(text):
    """Match known lab test names."""
    found = []
    text_lower = text.lower()
    for lab in KNOWN_LABS:
        if lab.lower() in text_lower and lab not in found:
            found.append(lab)
    return found


def extract_notes(text):
    """Find advice / notes section."""
    patterns = [
        r"(?:advis(?:e|ed)|notes?|instruction[s]?|follow[- ]?up)[:\-]?\s+([^.;]+?)(?:\.|;|$)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip(" ,.")
    return ""


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _looks_like_medicine(word):
    """Heuristic: medicines often end in common suffixes."""
    suffixes = ("cillin", "mycin", "azole", "pril", "sartan", "olol",
                "statin", "dipine", "prazole", "floxacin")
    return any(word.lower().endswith(s) for s in suffixes)


def _find_frequency_alias(text, med_name):
    """Look for frequency phrase within ~50 chars after the medicine name."""
    idx = text.find(med_name)
    if idx == -1:
        return ""
    window = text[idx:idx + 80]
    for alias, code in FREQUENCY_MAP.items():
        if re.search(r"\b" + re.escape(alias) + r"\b", window):
            return code
    return ""


# --------------------------------------------------------------------------
# Main entry point
# --------------------------------------------------------------------------
def extract(transcript):
    """Run the full extraction pipeline on a transcript."""
    if not transcript:
        return {
            "complaints": "",
            "diagnosis": "",
            "medicines": [],
            "labs": [],
            "notes": "",
        }

    return {
        "complaints": extract_complaints(transcript),
        "diagnosis": extract_diagnosis(transcript),
        "medicines": extract_medicines(transcript),
        "labs": extract_labs(transcript),
        "notes": extract_notes(transcript),
    }
