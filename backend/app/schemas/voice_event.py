from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ClientAction(str, Enum):
    START_SESSION = "START_SESSION"
    AUDIO_CHUNK = "AUDIO_CHUNK"
    STOP_STREAM = "STOP_STREAM"
    BARGE_IN = "BARGE_IN"
    CONFIRM_RECORD = "CONFIRM_RECORD"
    CORRECT_FIELD = "CORRECT_FIELD"
    SUBMIT_MANUAL_TRANSCRIPT = "SUBMIT_MANUAL_TRANSCRIPT"

class ServerEvent(str, Enum):
    SESSION_INITIALIZED = "SESSION_INITIALIZED"
    INTERIM_TRANSCRIPT = "INTERIM_TRANSCRIPT"
    FINAL_TRANSCRIPT = "FINAL_TRANSCRIPT"
    FIELDS_EXTRACTED = "FIELDS_EXTRACTED"
    SAFETY_ALERT = "SAFETY_ALERT"
    READBACK_READY = "READBACK_READY"
    BARGE_IN_CONFIRMED = "BARGE_IN_CONFIRMED"
    RECORD_SAVED = "RECORD_SAVED"
    ERROR = "ERROR"

class VoiceClientMessage(BaseModel):
    action: ClientAction
    language: str = "hi-IN"
    beneficiary_id: Optional[str] = None
    manual_transcript: Optional[str] = None
    audio_base64: Optional[str] = None
    corrected_field: Optional[str] = None
    corrected_value: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class MandatoryVisitFields(BaseModel):
    beneficiary_id: str = Field(..., description="1. Synthetic Beneficiary ID (e.g. BEN-102)")
    visit_type: str = Field(..., description="2. Home Visit Type (ANC, HBNC Newborn, PNC, Immunisation)")
    weight: float = Field(..., description="3. Weight in kilograms")
    vaccinations_due: str = Field(..., description="4. Vaccinations due (e.g. BCG, OPV-0 or None)")
    next_visit_date: str = Field(..., description="5. Next visit scheduled date (YYYY-MM-DD)")
    
    # Optional clinical context
    visit_notes: Optional[str] = None
    age: Optional[int] = None
    maternal_observations: Optional[str] = None
    newborn_observations: Optional[str] = None
    ifa_adherence: Optional[str] = None

class VoiceServerMessage(BaseModel):
    event: ServerEvent
    session_id: str
    transcript: Optional[str] = None
    is_final: bool = False
    provider: Optional[str] = None
    provider_status: Optional[str] = None
    is_simulated: bool = False
    extracted_data: Optional[MandatoryVisitFields] = None
    readback_text: Optional[str] = None
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    safety_alerts: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None
