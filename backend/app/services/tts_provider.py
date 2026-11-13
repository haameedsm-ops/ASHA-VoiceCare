from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.config import settings

class BaseTTSProvider(ABC):
    """
    Abstract Base Class for Text-To-Speech (TTS) Providers.
    Separates live Gnani Timbre integration from local simulation / Web Speech fallbacks.
    """
    @abstractmethod
    def generate_readback_script(
        self,
        beneficiary_id: str,
        visit_type: str,
        weight: float,
        vaccinations_due: str,
        next_visit_date: str,
        language_code: str = "hi-IN"
    ) -> str:
        """Formats the clinical verification read-back script per PRD Module 5."""
        pass

    @abstractmethod
    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi-IN"
    ) -> Dict[str, Any]:
        """Synthesizes speech audio for the provided text."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns provider operational status."""
        pass


class SimulatedTTSProvider(BaseTTSProvider):
    """
    Simulated TTS Provider for offline and local development.
    Formats exact read-back scripts and instructs frontend to use local Web Speech API.
    Never pretends a live Gnani audio stream was synthesized.
    """
    def generate_readback_script(
        self,
        beneficiary_id: str,
        visit_type: str,
        weight: float,
        vaccinations_due: str,
        next_visit_date: str,
        language_code: str = "hi-IN"
    ) -> str:
        clean_id = beneficiary_id.replace("BEN-", "")
        return (
            f"I recorded beneficiary {clean_id}, visit type {visit_type}, "
            f"weight {weight} kilograms, vaccinations due {vaccinations_due}, "
            f"and next visit date {next_visit_date}. Is this correct?"
        )

    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi-IN"
    ) -> Dict[str, Any]:
        return {
            "text": text,
            "audio_content": None,
            "content_type": "text/plain",
            "provider": "Simulated TTS Provider (Client Web Speech Fallback)",
            "provider_status": "CLIENT_SPEECH_SYNTHESIS",
            "is_simulated": True,
            "message": "Live Gnani Timbre TTS is disconnected. Text delivered for browser speech synthesis."
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider_name": "SimulatedTTSProvider",
            "mode": "SIMULATED",
            "is_live": False,
            "status": "CLIENT_SPEECH_SYNTHESIS",
            "description": "Simulation mode active. Client Web Speech API used for audio output."
        }


class GnaniTimbreLiveTTSProvider(BaseTTSProvider):
    """
    Live Adapter for Gnani Timbre v3.0 Text-To-Speech.
    Strictly disabled until official Gnani API specifications and valid credentials are provided.
    Does NOT invent endpoints, headers, or request payloads.
    """
    def __init__(self, api_key: Optional[str] = None, access_token: Optional[str] = None, endpoint_url: Optional[str] = None):
        self.api_key = api_key or settings.GNANI_API_KEY
        self.access_token = access_token or settings.GNANI_ACCESS_TOKEN
        self.endpoint_url = endpoint_url or settings.GNANI_TIMBRE_URL
        self.is_configured = bool(self.api_key and self.access_token and self.api_key.strip() and self.access_token.strip())

    def generate_readback_script(
        self,
        beneficiary_id: str,
        visit_type: str,
        weight: float,
        vaccinations_due: str,
        next_visit_date: str,
        language_code: str = "hi-IN"
    ) -> str:
        clean_id = beneficiary_id.replace("BEN-", "")
        return (
            f"I recorded beneficiary {clean_id}, visit type {visit_type}, "
            f"weight {weight} kilograms, vaccinations due {vaccinations_due}, "
            f"and next visit date {next_visit_date}. Is this correct?"
        )

    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi-IN"
    ) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "text": text,
                "audio_content": None,
                "provider": "Gnani Timbre v3.0 (Disabled)",
                "provider_status": "PROVIDER_UNAVAILABLE",
                "is_simulated": False,
                "message": "Live Gnani Timbre v3.0 is disabled: missing credentials or unverified official specs."
            }
        raise NotImplementedError("Live Gnani Timbre synthesize_speech awaiting verified official documentation.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider_name": "GnaniTimbreLiveTTSProvider",
            "mode": "LIVE_DISABLED",
            "is_live": False,
            "is_configured": self.is_configured,
            "status": "PROVIDER_UNAVAILABLE" if not self.is_configured else "PENDING_VERIFIED_SPECS",
            "endpoint": self.endpoint_url,
            "description": "Live integration disabled pending official Gnani documentation and credentials."
        }
