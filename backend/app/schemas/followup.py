from pydantic import BaseModel, ConfigDict
from typing import Optional

class FollowupCreate(BaseModel):
    beneficiary_id: str
    visit_id: str
    due_date: str
    followup_type: str
    status: Optional[str] = "pending"

class FollowupUpdate(BaseModel):
    status: str

class FollowupResponse(FollowupCreate):
    followup_id: str

    model_config = ConfigDict(from_attributes=True)
