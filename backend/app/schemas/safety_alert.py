from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SafetyAlertCreate(BaseModel):
    visit_id: str
    rule_id: str
    trigger_reason: str
    referral_status: str

class SafetyAlertResponse(SafetyAlertCreate):
    alert_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
