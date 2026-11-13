import asyncio
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(backend_path))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.beneficiary import Beneficiary
from app.models.visit import Visit
from app.models.safety_alert import SafetyAlert
from app.models.followup import Followup

async def seed_database():
    print("[*] Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("[✓] Tables created.")

    async with AsyncSessionLocal() as session:
        print("[*] Seeding synthetic village beneficiaries (Rampur Sub-Centre)...")

        # 1. Beneficiaries
        bens = [
            Beneficiary(
                beneficiary_id="BEN-101",
                name="Meena Sharma",
                age=24,
                category="ANC",
                hamlet="Rampur - Purva Tola",
                contact="+91 98765 43210"
            ),
            Beneficiary(
                beneficiary_id="BEN-102",
                name="Pooja Verma (Baby of Pooja)",
                age=0,
                category="Newborn",
                hamlet="Rampur - Main Basti",
                contact="+91 98765 11223"
            ),
            Beneficiary(
                beneficiary_id="BEN-103",
                name="Anita Devi",
                age=28,
                category="PNC",
                hamlet="Rampur - Harijan Basti",
                contact="+91 98765 99887"
            ),
            Beneficiary(
                beneficiary_id="BEN-104",
                name="Sunita Yadav (Baby of Sunita)",
                age=0,
                category="Newborn",
                hamlet="Rampur - Patel Nagar",
                contact="+91 98765 33445"
            ),
            Beneficiary(
                beneficiary_id="BEN-105",
                name="Kavita Singh",
                age=22,
                category="ANC",
                hamlet="Rampur - Purva Tola",
                contact="+91 98765 66778"
            ),
            Beneficiary(
                beneficiary_id="BEN-106",
                name="Radha Kumari (Baby of Radha)",
                age=1,
                category="Child",
                hamlet="Rampur - Main Basti",
                contact="+91 98765 77889"
            ),
        ]
        session.add_all(bens)
        await session.flush()
        print(f"[✓] Seeded {len(bens)} beneficiaries.")

        # 2. Visits with 5 Mandatory Fields
        visits = [
            Visit(
                visit_id="VIS-901",
                beneficiary_id="BEN-102",
                visit_type="HBNC Home Visit (Day 14)",
                weight=2.80,
                vaccinations_due="BCG, OPV-0, Hepatitis B-0",
                next_visit_date="2026-11-23",
                visit_notes="Baby feeding well at breast, no fever, umbilical cord stump dry and detached.",
                transcript="Today I visited beneficiary 102. Baby weight is 2.8 kilograms. Vaccinations due are BCG and OPV zero. Next visit scheduled on 23 November.",
                confirmation_status="confirmed"
            ),
            Visit(
                visit_id="VIS-902",
                beneficiary_id="BEN-104",
                visit_type="HBNC Home Visit (Day 3)",
                weight=1.95,
                vaccinations_due="Hepatitis B-0, OPV-0",
                next_visit_date="2026-11-14",
                visit_notes="Low birth weight observed (1.95 kg). Advised Kangaroo Mother Care and urgent PHC consultation.",
                transcript="Beneficiary 104 home visit day 3. Baby weight is 1.95 kg. Weak cry noted. Next visit 14 November.",
                confirmation_status="confirmed"
            ),
            Visit(
                visit_id="VIS-903",
                beneficiary_id="BEN-101",
                visit_type="ANC Visit (3rd Trimester)",
                weight=54.50,
                vaccinations_due="TT-2 Booster",
                next_visit_date="2026-11-20",
                visit_notes="BP normal (118/78), fetal movement active. Advised 100 IFA tablets intake.",
                transcript="ANC visit for beneficiary 101. Weight 54.5 kg, TT 2 booster due, next checkup on 20 November.",
                confirmation_status="confirmed"
            )
        ]
        session.add_all(visits)
        await session.flush()
        print(f"[✓] Seeded {len(visits)} verified field visit records.")

        # 3. Clinical Safety Alerts (HBNC / IMNCI)
        alerts = [
            SafetyAlert(
                alert_id="ALT-001",
                visit_id="VIS-902",
                rule_id="HBNC-NB-001",
                trigger_reason="Low birth weight (< 2.0 kg detected: 1.95 kg)",
                referral_status="IMMEDIATE_PHC_REFERRAL"
            )
        ]
        session.add_all(alerts)
        await session.flush()
        print(f"[✓] Seeded {len(alerts)} danger-sign safety alerts.")

        # 4. Scheduled Follow-ups
        followups = [
            Followup(
                followup_id="FUP-301",
                beneficiary_id="BEN-104",
                visit_id="VIS-902",
                due_date="2026-11-14",
                followup_type="Weight Check & PHC Follow-up",
                status="pending"
            ),
            Followup(
                followup_id="FUP-302",
                beneficiary_id="BEN-101",
                visit_id="VIS-903",
                due_date="2026-11-20",
                followup_type="ANC Checkup (36 Weeks)",
                status="pending"
            ),
            Followup(
                followup_id="FUP-303",
                beneficiary_id="BEN-102",
                visit_id="VIS-901",
                due_date="2026-11-23",
                followup_type="HBNC Home Visit (Day 21)",
                status="pending"
            )
        ]
        session.add_all(followups)
        await session.commit()
        print(f"[✓] Seeded {len(followups)} scheduled follow-ups.")

    print("\n[SUCCESS] Synthetic database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
