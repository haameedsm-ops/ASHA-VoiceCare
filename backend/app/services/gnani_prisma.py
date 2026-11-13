from typing import Optional, Dict, Any
from app.config import settings
from app.services.stt_provider import BaseSTTProvider, SimulatedSTTProvider, GnaniPrismaLiveSTTProvider

class GnaniPrismaClient(BaseSTTProvider):
    """
    Client Manager for Gnani Prisma v3.0 STT.
    Delegates to GnaniPrismaLiveSTTProvider when live credentials exist,
    or SimulatedSTTProvider when running offline.
    Never fabricates fake speech transcripts when live STT is offline.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        endpoint_url: Optional[str] = None
    ):
        self.api_key = api_key or settings.GNANI_API_KEY
        self.access_token = access_token or settings.GNANI_ACCESS_TOKEN
        self.endpoint_url = endpoint_url or settings.GNANI_PRISMA_WS_URL
        self.is_live = bool(self.api_key and self.access_token and self.api_key.strip() and self.access_token.strip())

        if self.is_live:
            self._provider = GnaniPrismaLiveSTTProvider(self.api_key, self.access_token, self.endpoint_url)
        else:
            self._provider = SimulatedSTTProvider()

    async def start_stream(self, language_code: str = "hi-IN", beneficiary_id: Optional[str] = None):
        await self._provider.start_stream(language_code, beneficiary_id)

    async def send_audio_chunk(self, chunk_bytes: bytes):
        await self._provider.send_audio_chunk(chunk_bytes)

    def set_manual_transcript(self, transcript: str):
        """Allows injecting a user test transcript labeled as MANUAL TEST INPUT."""
        if isinstance(self._provider, SimulatedSTTProvider):
            self._provider.set_manual_transcript(transcript)

    async def finish_stream(self) -> Dict[str, Any]:
        return await self._provider.finish_stream()

    def get_status(self) -> Dict[str, Any]:
        status = self._provider.get_status()
        status["service"] = "Gnani Prisma v3.0 STT"
        status["sample_rate"] = 16000
        status["configured_languages"] = ["hi-IN", "kn-IN", "te-IN", "mr-IN", "ta-IN", "en-IN"]
        return status
