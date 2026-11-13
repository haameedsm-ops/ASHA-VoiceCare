from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.safety_alert import SafetyAlert
from app.schemas.safety_alert import SafetyAlertResponse

router = APIRouter()

@router.get("/safety/alerts", response_model=List[SafetyAlertResponse], tags=["Safety Engine"])
async def list_safety_alerts(db: AsyncSession = Depends(get_db)):
    query = select(SafetyAlert).order_by(SafetyAlert.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
