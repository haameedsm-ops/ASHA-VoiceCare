from enum import Enum
from typing import Optional, Dict, Any, List, Tuple
from app.schemas.voice_event import MandatoryVisitFields, ServerEvent, VoiceServerMessage
from app.services.llm_extractor import StructuredInformationExtractor
from app.services.gnani_timbre import GnaniTimbreClient
from app.safety.rules_engine import SafetyRulesEngine

class OrchestratorState(str, Enum):
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    EXTRACTING = "EXTRACTING"
    VALIDATING = "VALIDATING"
    EVALUATING_SAFETY = "EVALUATING_SAFETY"
    ASKING_CLARIFICATION = "ASKING_CLARIFICATION"
    READING_BACK = "READING_BACK"
    AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION"
    PROCESSING_CORRECTION = "PROCESSING_CORRECTION"
    RECORD_SAVED = "RECORD_SAVED"

class AgentOrchestrator:
    """
    Custom Python Voice Agent Orchestrator for ASHA VoiceCare.
    Maintains visit session state, manages turn-taking, mandatory field validation,
    clarification loop, spoken corrections, and read-back audio generation.
    """
    def __init__(self, session_id: str, language_code: str = "hi-IN", beneficiary_id: Optional[str] = None):
        self.session_id = session_id
        self.language_code = language_code
        self.beneficiary_id = beneficiary_id
        self.state = OrchestratorState.IDLE
        self.extractor = StructuredInformationExtractor()
        self.timbre_client = GnaniTimbreClient()
        self.safety_engine = SafetyRulesEngine()
        
        self.raw_transcript = ""
        self.extracted_fields: Optional[MandatoryVisitFields] = None
        self.missing_fields: List[str] = []
        self.safety_alerts: List[Dict[str, Any]] = []

    def start_listening(self):
        self.state = OrchestratorState.LISTENING

    def on_transcript_complete(self, transcript: str) -> Dict[str, Any]:
        """Processes finalized transcript from Gnani Prisma"""
        self.raw_transcript = transcript
        self.state = OrchestratorState.EXTRACTING

        fields, missing = self.extractor.extract(
            transcript=transcript,
            preselected_beneficiary_id=self.beneficiary_id
        )

        if missing:
            self.state = OrchestratorState.ASKING_CLARIFICATION
            self.missing_fields = missing
            clarification_question = self._generate_clarification_prompt(missing[0])
            return {
                "status": "NEEDS_CLARIFICATION",
                "missing_field": missing[0],
                "prompt": clarification_question
            }

        self.extracted_fields = fields
        
        # Evaluate Independent Safety Rules Engine
        self.state = OrchestratorState.EVALUATING_SAFETY
        self.safety_alerts = self.safety_engine.evaluate(fields, full_text=transcript)

        self.state = OrchestratorState.READING_BACK
        
        readback_text = self.timbre_client.generate_readback_script(
            beneficiary_id=fields.beneficiary_id,
            visit_type=fields.visit_type,
            weight=fields.weight,
            vaccinations_due=fields.vaccinations_due,
            next_visit_date=fields.next_visit_date,
            language_code=self.language_code
        )

        return {
            "status": "READY_FOR_READBACK",
            "extracted_fields": fields,
            "readback_text": readback_text,
            "safety_alerts": self.safety_alerts
        }

    def handle_barge_in(self) -> Dict[str, Any]:
        """Interrupts agent speech and resets state to receive spoken correction"""
        self.state = OrchestratorState.LISTENING
        return {
            "status": "BARGE_IN_PROCESSED",
            "message": "Agent playback halted. Listening for worker correction."
        }

    def apply_spoken_correction(self, correction_text: str) -> Dict[str, Any]:
        """Updates extracted fields based on spoken correction"""
        self.state = OrchestratorState.PROCESSING_CORRECTION
        
        # Check if correction includes a new weight
        import re
        weight_match = re.search(r'\b([0-9]+(?:\.[0-9]+)?)\s*(?:kg|kgs|kilograms?|किलो)?\b', correction_text, re.IGNORECASE)
        if weight_match and self.extracted_fields:
            self.extracted_fields.weight = float(weight_match.group(1))

        # Check if correction includes a next visit date
        date_match = re.search(r'\b(202[5-9]-[0-1][0-9]-[0-3][0-9])\b', correction_text)
        if date_match and self.extracted_fields:
            self.extracted_fields.next_visit_date = date_match.group(1)

        self.state = OrchestratorState.READING_BACK
        new_readback = self.timbre_client.generate_readback_script(
            beneficiary_id=self.extracted_fields.beneficiary_id,
            visit_type=self.extracted_fields.visit_type,
            weight=self.extracted_fields.weight,
            vaccinations_due=self.extracted_fields.vaccinations_due,
            next_visit_date=self.extracted_fields.next_visit_date,
            language_code=self.language_code
        )

        return {
            "status": "CORRECTION_APPLIED",
            "extracted_fields": self.extracted_fields,
            "readback_text": new_readback
        }

    def confirm_and_persist(self) -> Dict[str, Any]:
        """Marks the visit record confirmed and ready to commit to database"""
        self.state = OrchestratorState.RECORD_SAVED
        return {
            "status": "CONFIRMED",
            "record": self.extracted_fields
        }

    def _generate_clarification_prompt(self, field_name: str) -> str:
        prompts = {
            "beneficiary_id": "Please specify the Beneficiary ID or name.",
            "weight": "Please state the beneficiary's weight in kilograms.",
            "vaccinations_due": "Are there any vaccinations due, or none?",
            "next_visit_date": "What date is the next follow-up visit scheduled?",
            "visit_type": "Is this an ANC, newborn HBNC, or routine visit?"
        }
        return prompts.get(field_name, f"Please provide the {field_name}.")
