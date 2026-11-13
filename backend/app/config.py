from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "ASHA VoiceCare API"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    SECRET_KEY: str = "asha-voicecare-secure-dev-secret-key-32chars"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./asha_voicecare.db"

    # Gnani Platform
    GNANI_API_KEY: Optional[str] = None
    GNANI_ACCESS_TOKEN: Optional[str] = None
    GNANI_PRISMA_WS_URL: str = "wss://api.gnani.ai/prisma/v3/stream"
    GNANI_TIMBRE_URL: str = "https://api.gnani.ai/timbre/v3/synthesize"
    GNANI_SIMULATION_MODE: bool = True

    # LLM
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
