from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    beneficiary_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    category = Column(String(64), default="ANC")
    hamlet = Column(String(255), nullable=True)
    contact = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    visits = relationship("Visit", back_populates="beneficiary", cascade="all, delete-orphan", lazy="selectin")
    followups = relationship("Followup", back_populates="beneficiary", cascade="all, delete-orphan", lazy="selectin")
