from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.models.beneficiary import Beneficiary
from app.schemas.beneficiary import BeneficiaryCreate, BeneficiaryResponse

router = APIRouter()

@router.get("/beneficiaries", response_model=List[BeneficiaryResponse], tags=["Beneficiaries"])
async def list_beneficiaries(
    q: Optional[str] = Query(None, description="Search query for name, id, or hamlet"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Beneficiary).order_by(Beneficiary.created_at.desc())
    result = await db.execute(query)
    beneficiaries = result.scalars().all()

    if q:
        q_lower = q.lower()
        beneficiaries = [
            b for b in beneficiaries
            if q_lower in b.name.lower() or q_lower in b.beneficiary_id.lower() or (b.hamlet and q_lower in b.hamlet.lower())
        ]

    return beneficiaries

@router.get("/beneficiaries/{beneficiary_id}", response_model=BeneficiaryResponse, tags=["Beneficiaries"])
async def get_beneficiary(beneficiary_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Beneficiary).where(Beneficiary.beneficiary_id == beneficiary_id)
    result = await db.execute(query)
    beneficiary = result.scalar_one_or_none()
    if not beneficiary:
        raise HTTPException(status_code=404, detail=f"Beneficiary {beneficiary_id} not found")
    return beneficiary

@router.post("/beneficiaries", response_model=BeneficiaryResponse, status_code=201, tags=["Beneficiaries"])
async def create_beneficiary(payload: BeneficiaryCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    query = select(Beneficiary).where(Beneficiary.beneficiary_id == payload.beneficiary_id)
    existing = (await db.execute(query)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail=f"Beneficiary ID {payload.beneficiary_id} already exists")

    new_ben = Beneficiary(
        beneficiary_id=payload.beneficiary_id,
        name=payload.name,
        age=payload.age,
        category=payload.category,
        hamlet=payload.hamlet,
        contact=payload.contact
    )
    db.add(new_ben)
    await db.commit()
    await db.refresh(new_ben)
    return new_ben
