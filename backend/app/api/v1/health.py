from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health", tags=["System"])
async def health_check():
    has_gnani_keys = bool(settings.GNANI_API_KEY and settings.GNANI_ACCESS_TOKEN)
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "sqlite_fallback" if "sqlite" in settings.DATABASE_URL else "postgresql",
        "gnani_platform": {
            "prisma_stt": "CONFIGURED_LIVE" if has_gnani_keys else "SIMULATED_DEVELOPMENT_MODE",
            "timbre_tts": "CONFIGURED_LIVE" if has_gnani_keys else "SIMULATED_DEVELOPMENT_MODE",
            "simulation_mode": settings.GNANI_SIMULATION_MODE if not has_gnani_keys else False,
            "prisma_endpoint": settings.GNANI_PRISMA_WS_URL,
            "timbre_endpoint": settings.GNANI_TIMBRE_URL,
        },
        "mandatory_fields_enforced": [
            "beneficiary_id",
            "visit_type",
            "weight",
            "vaccinations_due",
            "next_visit_date"
        ],
        "safety_engine": "MoHFW_HBNC_IMNCI_ACTIVE"
    }
