# CRIS HMIS Voice Scribe

A voice-to-structured-data web application for the Centre for Railway Information Systems (CRIS), Ministry of Railways. Doctors dictate prescriptions and the app auto-fills a structured medical encounter form.

## Live Demo

**https://shivanshx333.github.io/cris-hmis-voice-scribe/**

The hosted version runs entirely in the browser — no installation required. Open the link on any device with Chrome, Edge, or Safari.

## Features

- **UMID-based patient lookup** with mock railway employee data
- **Live voice dictation** powered by the browser's Web Speech API
- **Auto-fill structured form**: chief complaints, diagnosis, medicines table, lab tests, advisory notes
- **Editable medicines table** with frequency codes (BD / TID / OD / 1-0-1)
- **A4 printable prescription** with hospital header and signature line
- **Persistent storage** in the browser's localStorage
- **Fully offline** after first load — no backend required

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS 3 + Lucide Icons
- **NLP:** In-browser rule-based extractor (JavaScript regex)
- **Speech:** Browser Web Speech API (Chrome / Edge / Safari)
- **Storage:** Browser localStorage
- **Hosting:** GitHub Pages (free static hosting)

## Local Development

Requires **Node.js 18+**.

```
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Optional Backend

A FastAPI backend with SQLite persistence is included in `backend/` for reference and for organizations that prefer server-side storage. The hosted version does not use it — the frontend ships with the full extractor and stores records in localStorage.

To run the optional backend:

```
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## How to Use

1. **Search for a patient** by UMID (try `RLY-2024-001`) and select from the dropdown.
2. **Click the mic** in the Voice Dictation Hub and speak a prescription:
   > "Patient presenting with fever and cough for 3 days, diagnosed with viral URI. Prescribed Paracetamol 500mg BD for 5 days. Advised CBC and MP."
3. Click **Process Transcript**. The Smart Form on the right auto-fills with extracted fields.
4. **Edit** any field as needed — everything is fully editable.
5. **Save to HMIS** persists the encounter to localStorage.
6. **Print** generates an A4 prescription PDF.

## Mock Patients

| UMID | Name | Designation | Unit |
|------|------|-------------|------|
| RLY-2024-001 | Rajesh Kumar | Loco Pilot | Diesel Shed Patiala |
| RLY-2024-002 | Sunita Devi | Station Master | New Delhi |
| RLY-2024-003 | Amit Sharma | Track Maintainer | Delhi Division |
| RLY-2024-004 | Priya Singh | Ticket Examiner | Mumbai Central |

## Deployment

Pushes to `master` trigger a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the Vite frontend and deploys to GitHub Pages.
