from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class BeneficiaryBase(BaseModel):
    name: str
    age: Optional[int] = None
    category: Optional[str] = "ANC"
    hamlet: Optional[str] = None
    contact: Optional[str] = None

class BeneficiaryCreate(BeneficiaryBase):
    beneficiary_id: str

class BeneficiaryResponse(BeneficiaryBase):
    beneficiary_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
