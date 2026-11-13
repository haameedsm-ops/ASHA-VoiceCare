from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all models are registered
from app.api.v1.health import router as health_router
from app.api.v1.beneficiaries import router as beneficiaries_router
from app.api.v1.visits import router as visits_router
from app.api.v1.followups import router as followups_router
from app.api.v1.safety import router as safety_router
from app.api.websocket.voice_stream import router as websocket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created
    print(f"[*] Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[*] Database schema initialized.")
    yield
    # Shutdown actions
    print(f"[*] Shutting down {settings.APP_NAME}...")
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend API and Voice Orchestrator for ASHA VoiceCare - AI-Powered Voice Field Register",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(beneficiaries_router, prefix="/api/v1")
app.include_router(visits_router, prefix="/api/v1")
app.include_router(followups_router, prefix="/api/v1")
app.include_router(safety_router, prefix="/api/v1")

# Mount WebSocket Route
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "message": "ASHA VoiceCare API is running.",
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
        "voice_websocket": "/ws/voice-register"
    }
