from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.config import settings

class BaseSTTProvider(ABC):
    """
    Abstract Base Class for Speech-To-Text (STT) Providers.
    Ensures strict separation between live Gnani platform adapters and offline/simulation services.
    """
    @abstractmethod
    async def start_stream(self, language_code: str = "hi-IN", beneficiary_id: Optional[str] = None):
        """Initializes a new streaming STT session."""
        pass

    @abstractmethod
    async def send_audio_chunk(self, chunk_bytes: bytes):
        """Streams a 16kHz 16-bit mono linear PCM audio chunk to the STT engine."""
        pass

    @abstractmethod
    async def finish_stream(self) -> Dict[str, Any]:
        """Finalizes the streaming session and returns the transcribed result."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns the operational status of the provider."""
        pass


class SimulatedSTTProvider(BaseSTTProvider):
    """
    Simulated STT Provider for local development and offline environments.
    Strictly complies with the rule: NEVER fabricate transcripts or substitute fake visit data.
    """
    def __init__(self):
        self.language_code = "hi-IN"
        self.beneficiary_id: Optional[str] = None
        self.manual_transcript: Optional[str] = None
        self.pcm_chunk_count = 0

    async def start_stream(self, language_code: str = "hi-IN", beneficiary_id: Optional[str] = None):
        self.language_code = language_code
        self.beneficiary_id = beneficiary_id
        self.pcm_chunk_count = 0
        # Reset any one-shot manual transcript
        # (Unless explicitly set right before stream stop)

    async def send_audio_chunk(self, chunk_bytes: bytes):
        # Count received chunks
        self.pcm_chunk_count += 1

    def set_manual_transcript(self, transcript: str):
        """Sets a user-provided test transcript, explicitly flagged as MANUAL TEST INPUT."""
        self.manual_transcript = transcript.strip() if transcript else None

    async def finish_stream(self) -> Dict[str, Any]:
        """
        When live STT is unavailable, never invent fake transcripts.
        If a manual test transcript was provided, return it with explicit 'MANUAL TEST INPUT' labeling.
        Otherwise, return an empty transcript with 'WAITING_FOR_SPEECH' status.
        """
        if self.manual_transcript:
            tx = self.manual_transcript
            self.manual_transcript = None  # Consume once
            return {
                "transcript": tx,
                "is_final": True,
                "confidence": 1.0,
                "provider": "MANUAL TEST INPUT",
                "provider_status": "MANUAL_TEST_INPUT",
                "is_simulated": True,
                "message": "Processed from manual test input. Distinct from acoustic microphone transcription."
            }

        # No real speech recognition engine is connected
        return {
            "transcript": "",
            "is_final": True,
            "confidence": 0.0,
            "provider": "Simulated STT Provider (Offline)",
            "provider_status": "WAITING_FOR_SPEECH",
            "is_simulated": True,
            "pcm_chunks_received": self.pcm_chunk_count,
            "message": "Live Gnani Prisma v3.0 STT is disconnected. No audio transcription was fabricated."
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider_name": "SimulatedSTTProvider",
            "mode": "SIMULATED",
            "is_live": False,
            "live_connection_available": False,
            "status": "WAITING_FOR_SPEECH_OR_MANUAL_INPUT",
            "description": "Simulation mode active. Never fabricates transcripts."
        }


class GnaniPrismaLiveSTTProvider(BaseSTTProvider):
    """
    Live Adapter for Gnani Prisma v3.0 Streaming Speech-To-Text.
    Strictly disabled until official Gnani API specifications, endpoint contracts,
    and valid credentials are provided.
    Does NOT invent endpoints, headers, or request payloads.
    """
    def __init__(self, api_key: Optional[str] = None, access_token: Optional[str] = None, endpoint_url: Optional[str] = None):
        self.api_key = api_key or settings.GNANI_API_KEY
        self.access_token = access_token or settings.GNANI_ACCESS_TOKEN
        self.endpoint_url = endpoint_url or settings.GNANI_PRISMA_WS_URL
        self.is_configured = bool(self.api_key and self.access_token and self.api_key.strip() and self.access_token.strip())

    async def start_stream(self, language_code: str = "hi-IN", beneficiary_id: Optional[str] = None):
        if not self.is_configured:
            raise RuntimeError(
                "Gnani Prisma v3.0 Live STT is disabled: GNANI_API_KEY and GNANI_ACCESS_TOKEN "
                "are missing. Official Gnani documentation must be verified before connecting."
            )
        # When live credentials and official documentation are verified, connect here.
        raise NotImplementedError("Live Gnani Prisma v3.0 integration is awaiting verified official documentation.")

    async def send_audio_chunk(self, chunk_bytes: bytes):
        if not self.is_configured:
            return

    async def finish_stream(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "transcript": "",
                "is_final": True,
                "provider": "Gnani Prisma v3.0 (Disabled)",
                "provider_status": "PROVIDER_UNAVAILABLE",
                "is_simulated": False,
                "message": "Live Gnani Prisma v3.0 is disabled: missing credentials or unverified official specs."
            }
        raise NotImplementedError("Live Gnani Prisma finish_stream awaiting verified official documentation.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider_name": "GnaniPrismaLiveSTTProvider",
            "mode": "LIVE_DISABLED",
            "is_live": False,
            "is_configured": self.is_configured,
            "status": "PROVIDER_UNAVAILABLE" if not self.is_configured else "PENDING_VERIFIED_SPECS",
            "endpoint": self.endpoint_url,
            "description": "Live integration disabled pending official Gnani documentation and credentials."
        }
