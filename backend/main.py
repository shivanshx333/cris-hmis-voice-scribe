"""
FastAPI backend for CRIS HMIS Voice Scribe.
Handles patient lookup, transcript extraction, and encounter storage.
"""

import json
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import init_db, get_db, Patient, Encounter
from extractor import extract


# --------------------------------------------------------------------------
# App setup
# --------------------------------------------------------------------------
app = FastAPI(title="CRIS HMIS Voice Scribe API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------
class TranscriptIn(BaseModel):
    transcript: str


class Medicine(BaseModel):
    name: str
    dosage: str = ""
    frequency: str = ""
    duration: str = ""


class EncounterIn(BaseModel):
    umid: Optional[str] = None
    transcript: str = ""
    complaints: str = ""
    diagnosis: str = ""
    medicines: List[Medicine] = []
    labs: List[str] = []
    notes: str = ""


class PatientOut(BaseModel):
    id: int
    umid: str
    name: str
    age: Optional[int] = None
    sex: Optional[str] = None
    designation: Optional[str] = None
    unit: Optional[str] = None

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "CRIS HMIS Voice Scribe API"}


@app.post("/api/extract")
def extract_endpoint(payload: TranscriptIn):
    """Run rule-based extraction on the provided transcript."""
    return extract(payload.transcript)


@app.post("/api/save")
def save_encounter(payload: EncounterIn, db: Session = Depends(get_db)):
    """Persist an encounter record to SQLite."""
    patient = None
    if payload.umid:
        patient = db.query(Patient).filter(Patient.umid == payload.umid).first()

    encounter = Encounter(
        patient_id=patient.id if patient else None,
        umid=payload.umid or "",
        transcript=payload.transcript,
        complaints=payload.complaints,
        diagnosis=payload.diagnosis,
        medicines_json=json.dumps([m.model_dump() for m in payload.medicines]),
        labs_json=json.dumps(payload.labs),
        notes=payload.notes,
    )
    db.add(encounter)
    db.commit()
    db.refresh(encounter)

    return {
        "status": "saved",
        "id": encounter.id,
        "created_at": encounter.created_at.isoformat(),
    }


@app.get("/api/patient/{umid}", response_model=PatientOut)
def get_patient(umid: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.umid == umid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/api/patients", response_model=List[PatientOut])
def list_patients(q: Optional[str] = None, db: Session = Depends(get_db)):
    """List patients, optionally filtered by UMID or name (case-insensitive)."""
    query = db.query(Patient)
    if q:
        like = f"%{q}%"
        query = query.filter((Patient.umid.ilike(like)) | (Patient.name.ilike(like)))
    return query.limit(10).all()
