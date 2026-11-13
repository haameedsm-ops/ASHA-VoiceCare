"""
Diagnostic Simulation Service for Gnani Platform Services
Active strictly when live Gnani credentials are pending.
Ensures zero fake integration claims while preserving end-to-end development velocity.
"""
from typing import AsyncGenerator, Dict, Any

class GnaniSimulatorService:
    @staticmethod
    def is_configured(api_key: str | None, access_token: str | None) -> bool:
        return bool(api_key and access_token and api_key.strip() and access_token.strip())

    @staticmethod
    async def simulate_streaming_stt(
        beneficiary_id: str | None,
        language_code: str = "hi-IN"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Yields realistic speech recognition progression clearly tagged as simulated.
        Simulates code-mixed field speech from an ASHA worker.
        """
        ben_num = beneficiary_id.replace("BEN-", "") if beneficiary_id else "102"
        
        simulated_transcript = (
            f"Today I visited beneficiary {ben_num}. "
            f"Baby weight is 2.8 kilograms. "
            f"Vaccinations due are BCG and OPV zero. "
            f"Next visit scheduled on 15 December. "
            f"Baby is feeding well at breast, no fever, cord stump dry."
        )

        words = simulated_transcript.split(" ")
        accumulated = []

        for i, word in enumerate(words):
            accumulated.append(word)
            current_text = " ".join(accumulated)
            is_final = (i == len(words) - 1)
            
            yield {
                "transcript": current_text,
                "is_final": is_final,
                "confidence": 0.94 if is_final else 0.82,
                "language_code": language_code,
                "provider": "Gnani Prisma v3.0 [SIMULATED - PENDING LIVE CREDENTIALS]"
            }
