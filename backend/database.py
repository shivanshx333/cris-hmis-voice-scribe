"""
database.py
===========
SQLite database setup for CRIS HMIS Voice Scribe.

Uses SQLAlchemy ORM for clean model definitions and session management.
"""

import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./hmis_voice.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    umid = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    sex = Column(String(2))
    designation = Column(String(100))
    unit = Column(String(100))

    encounters = relationship("Encounter", back_populates="patient")


class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    umid = Column(String(20), index=True)
    transcript = Column(Text)
    complaints = Column(Text)
    diagnosis = Column(Text)
    medicines_json = Column(Text)   # JSON-serialized list
    labs_json = Column(Text)         # JSON-serialized list
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="encounters")


# --------------------------------------------------------------------------
# Dependency
# --------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables and seed mock patients on first run."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Patient).count() == 0:
            mock_patients = [
                Patient(umid="RLY-2024-001", name="Rajesh Kumar", age=45, sex="M",
                        designation="Loco Pilot", unit="Diesel Shed Patiala"),
                Patient(umid="RLY-2024-002", name="Sunita Devi", age=38, sex="F",
                        designation="Station Master", unit="New Delhi"),
                Patient(umid="RLY-2024-003", name="Amit Sharma", age=52, sex="M",
                        designation="Track Maintainer", unit="Delhi Division"),
                Patient(umid="RLY-2024-004", name="Priya Singh", age=29, sex="F",
                        designation="Ticket Examiner", unit="Mumbai Central"),
            ]
            db.add_all(mock_patients)
            db.commit()
            print(f"[INFO] Seeded {len(mock_patients)} mock patients")
    finally:
        db.close()
