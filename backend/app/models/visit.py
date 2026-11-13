from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.core.database import Base

class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    beneficiary_id = Column(String(64), ForeignKey("beneficiaries.beneficiary_id", ondelete="CASCADE"), nullable=False, index=True)
    visit_type = Column(String(64), nullable=False)
    weight = Column(Float, nullable=False)
    vaccinations_due = Column(Text, nullable=False, default="None")
    next_visit_date = Column(String(32), nullable=False)
    visit_notes = Column(Text, nullable=True)
    transcript = Column(Text, nullable=False)
    confirmation_status = Column(String(32), default="confirmed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    beneficiary = relationship("Beneficiary", back_populates="visits")
    safety_alerts = relationship("SafetyAlert", back_populates="visit", cascade="all, delete-orphan", lazy="selectin")
    followups = relationship("Followup", back_populates="visit", cascade="all, delete-orphan", lazy="selectin")
