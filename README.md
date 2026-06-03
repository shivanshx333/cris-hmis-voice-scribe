# CRIS HMIS Voice Scribe

A voice-to-structured-data web application for the Centre for Railway Information Systems (CRIS), Ministry of Railways. Doctors dictate prescriptions and the app auto-fills a structured medical encounter form.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS 3 + Lucide Icons
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **NLP:** Local rule-based extractor (regex). No external APIs.
- **Speech:** Browser Web Speech API (no server-side AI required)

## Quick Start

You'll need **Python 3.10+** and **Node.js 18+**.

### 1. Backend (port 8000)

```
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The first run creates `hmis_voice.db` and seeds 4 mock patients.

### 2. Frontend (port 5173)

In a second terminal:

```
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## How to Use

1. **Search for a patient** by UMID (try `RLY-2024-001`) and select from the dropdown.
2. **Click the mic** in the Voice Dictation Hub and speak a prescription:
   > "Patient presenting with fever and cough for 3 days, diagnosed with viral URI. Prescribed Paracetamol 500mg BD for 5 days. Advised CBC and MP."
3. Click **Process Transcript**. The Smart Form on the right auto-fills with extracted fields (chief complaints, diagnosis, medicines table, lab tests, advisory).
4. **Edit** any field as needed — everything is fully editable.
5. **Save to HMIS** persists the encounter to SQLite.
6. **Print** generates an A4 prescription PDF.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/extract` | Run NLP on a transcript |
| POST | `/api/save` | Persist an encounter |
| GET | `/api/patient/{umid}` | Lookup patient |
| GET | `/api/patients?q=` | Search patients |

## Architecture Notes

- **Speech recognition runs in the browser** (Web Speech API) — works offline-style and avoids server-side ML dependencies.
- **The frontend tries the backend first**, and falls back to a local `mockExtract` if the backend is unreachable. This makes demos work even without the FastAPI server running.
- **Print layout** is a hidden React component shown only via `@media print` CSS rules.

## Mock Patients

| UMID | Name | Designation | Unit |
|------|------|-------------|------|
| RLY-2024-001 | Rajesh Kumar | Loco Pilot | Diesel Shed Patiala |
| RLY-2024-002 | Sunita Devi | Station Master | New Delhi |
| RLY-2024-003 | Amit Sharma | Track Maintainer | Delhi Division |
| RLY-2024-004 | Priya Singh | Ticket Examiner | Mumbai Central |
