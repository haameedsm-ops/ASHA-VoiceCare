from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Followup(Base):
    __tablename__ = "followups"

    followup_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    beneficiary_id = Column(String(64), ForeignKey("beneficiaries.beneficiary_id", ondelete="CASCADE"), nullable=False, index=True)
    visit_id = Column(String(64), ForeignKey("visits.visit_id", ondelete="CASCADE"), nullable=False, index=True)
    due_date = Column(String(32), nullable=False)
    followup_type = Column(String(64), nullable=False)  # e.g. "Vaccination", "Weight Check"
    status = Column(String(32), default="pending")      # "pending", "completed", "overdue"

    # Relationships
    beneficiary = relationship("Beneficiary", back_populates="followups")
    visit = relationship("Visit", back_populates="followups")
