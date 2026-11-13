from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.core.database import Base

class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    alert_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    visit_id = Column(String(64), ForeignKey("visits.visit_id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(64), nullable=False, index=True)
    trigger_reason = Column(Text, nullable=False)
    referral_status = Column(String(64), nullable=False)  # e.g. IMMEDIATE_PHC_REFERRAL, URGENT
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    visit = relationship("Visit", back_populates="safety_alerts")
