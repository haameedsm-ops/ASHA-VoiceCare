from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class VisitCreate(BaseModel):
    beneficiary_id: str = Field(..., description="1. Beneficiary ID")
    visit_type: str = Field(..., description="2. Visit Type")
    weight: float = Field(..., description="3. Weight in kg")
    vaccinations_due: str = Field(..., description="4. Vaccinations Due")
    next_visit_date: str = Field(..., description="5. Next Visit Date (YYYY-MM-DD)")
    visit_notes: Optional[str] = None
    transcript: str
    confirmation_status: Optional[str] = "confirmed"

class VisitResponse(VisitCreate):
    visit_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
