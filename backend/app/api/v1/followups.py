from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.models.followup import Followup
from app.schemas.followup import FollowupResponse, FollowupUpdate

router = APIRouter()

@router.get("/followups", response_model=List[FollowupResponse], tags=["Followups"])
async def list_followups(
    status: Optional[str] = Query(None, description="Filter by status: pending / completed"),
    beneficiary_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Followup).order_by(Followup.due_date.asc())
    if status:
        query = query.where(Followup.status == status)
    if beneficiary_id:
        query = query.where(Followup.beneficiary_id == beneficiary_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/followups/{followup_id}/status", response_model=FollowupResponse, tags=["Followups"])
async def update_followup_status(
    followup_id: str,
    payload: FollowupUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(Followup).where(Followup.followup_id == followup_id)
    result = await db.execute(query)
    followup = result.scalar_one_or_none()
    if not followup:
        raise HTTPException(status_code=404, detail="Followup record not found")
    
    followup.status = payload.status
    await db.commit()
    await db.refresh(followup)
    return followup
