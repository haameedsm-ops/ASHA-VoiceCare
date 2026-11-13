from typing import Optional, Dict, Any
from app.config import settings
from app.services.tts_provider import BaseTTSProvider, SimulatedTTSProvider, GnaniTimbreLiveTTSProvider

class GnaniTimbreClient(BaseTTSProvider):
    """
    Client Manager for Gnani Timbre v3.0 TTS.
    Delegates to GnaniTimbreLiveTTSProvider when live credentials exist,
    or SimulatedTTSProvider when running in development.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        endpoint_url: Optional[str] = None
    ):
        self.api_key = api_key or settings.GNANI_API_KEY
        self.access_token = access_token or settings.GNANI_ACCESS_TOKEN
        self.endpoint_url = endpoint_url or settings.GNANI_TIMBRE_URL
        self.is_live = bool(self.api_key and self.access_token and self.api_key.strip() and self.access_token.strip())

        if self.is_live:
            self._provider = GnaniTimbreLiveTTSProvider(self.api_key, self.access_token, self.endpoint_url)
        else:
            self._provider = SimulatedTTSProvider()

    def generate_readback_script(
        self,
        beneficiary_id: str,
        visit_type: str,
        weight: float,
        vaccinations_due: str,
        next_visit_date: str,
        language_code: str = "hi-IN"
    ) -> str:
        return self._provider.generate_readback_script(
            beneficiary_id, visit_type, weight, vaccinations_due, next_visit_date, language_code
        )

    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi-IN"
    ) -> Dict[str, Any]:
        return await self._provider.synthesize_speech(text, language_code)

    def get_status(self) -> Dict[str, Any]:
        status = self._provider.get_status()
        status["service"] = "Gnani Timbre v3.0 TTS"
        status["supported_languages"] = ["hi-IN", "kn-IN", "te-IN", "mr-IN", "ta-IN", "en-IN"]
        return status
