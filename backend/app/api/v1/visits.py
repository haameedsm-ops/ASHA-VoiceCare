from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from app.core.database import get_db
from app.models.visit import Visit
from app.models.beneficiary import Beneficiary
from app.models.followup import Followup
from app.schemas.visit import VisitCreate, VisitResponse

router = APIRouter()

@router.get("/visits", response_model=List[VisitResponse], tags=["Visits"])
async def list_visits(
    beneficiary_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Visit).order_by(Visit.created_at.desc())
    if beneficiary_id:
        query = query.where(Visit.beneficiary_id == beneficiary_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/visits/{visit_id}", response_model=VisitResponse, tags=["Visits"])
async def get_visit(visit_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Visit).where(Visit.visit_id == visit_id)
    result = await db.execute(query)
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit record not found")
    return visit

@router.post("/visits", response_model=VisitResponse, status_code=201, tags=["Visits"])
async def create_visit(payload: VisitCreate, db: AsyncSession = Depends(get_db)):
    # 1. Verify beneficiary exists
    b_query = select(Beneficiary).where(Beneficiary.beneficiary_id == payload.beneficiary_id)
    ben = (await db.execute(b_query)).scalar_one_or_none()
    if not ben:
        # Create beneficiary shell if first encounter
        ben = Beneficiary(
            beneficiary_id=payload.beneficiary_id,
            name=f"Beneficiary {payload.beneficiary_id}",
            category="General"
        )
        db.add(ben)
        await db.flush()

    # 2. Create Visit Record
    new_visit_id = f"vis_{uuid.uuid4().hex[:8]}"
    new_visit = Visit(
        visit_id=new_visit_id,
        beneficiary_id=payload.beneficiary_id,
        visit_type=payload.visit_type,
        weight=payload.weight,
        vaccinations_due=payload.vaccinations_due,
        next_visit_date=payload.next_visit_date,
        visit_notes=payload.visit_notes,
        transcript=payload.transcript,
        confirmation_status=payload.confirmation_status or "confirmed"
    )
    db.add(new_visit)

    # 3. Schedule next Followup automatically
    new_followup = Followup(
        followup_id=f"fup_{uuid.uuid4().hex[:8]}",
        beneficiary_id=payload.beneficiary_id,
        visit_id=new_visit_id,
        due_date=payload.next_visit_date,
        followup_type=f"Follow-up for {payload.visit_type}",
        status="pending"
    )
    db.add(new_followup)

    await db.commit()
    await db.refresh(new_visit)
    return new_visit
