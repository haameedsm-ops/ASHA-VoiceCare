import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_beneficiaries_and_search():
    res = client.get("/api/v1/beneficiaries")
    assert res.status_code == 200
    bens = res.json()
    assert len(bens) >= 6
    ben_ids = [b["beneficiary_id"] for b in bens]
    assert "BEN-101" in ben_ids
    assert "BEN-102" in ben_ids

    search_res = client.get("/api/v1/beneficiaries?q=Pooja")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data) >= 1
    assert "Pooja" in search_data[0]["name"]

def test_create_beneficiary():
    test_id = f"BEN-T{uuid.uuid4().hex[:6].upper()}"
    new_ben = {
        "beneficiary_id": test_id,
        "name": "Suman Lata",
        "age": 25,
        "category": "ANC",
        "hamlet": "Rampur - Tola 3",
        "contact": "+91 98765 00107"
    }
    res = client.post("/api/v1/beneficiaries", json=new_ben)
    assert res.status_code == 201
    created = res.json()
    assert created["beneficiary_id"] == test_id
    assert created["name"] == "Suman Lata"

    # Verify duplicate prevention
    dup_res = client.post("/api/v1/beneficiaries", json=new_ben)
    assert dup_res.status_code == 400

def test_visit_creation_with_5_mandatory_fields_and_followup():
    test_id = f"BEN-T{uuid.uuid4().hex[:6].upper()}"
    visit_payload = {
        "beneficiary_id": test_id,
        "visit_type": "ANC Routine Check (28 Weeks)",
        "weight": 56.20,
        "vaccinations_due": "TT-2",
        "next_visit_date": "2026-12-10",
        "visit_notes": "Normal BP, fetal heart rate verified.",
        "transcript": "ANC visit for beneficiary. Weight is 56.2 kg. TT-2 due. Next visit 10 December.",
        "confirmation_status": "confirmed"
    }

    res = client.post("/api/v1/visits", json=visit_payload)
    assert res.status_code == 201
    visit_data = res.json()
    assert visit_data["beneficiary_id"] == test_id
    assert visit_data["weight"] == 56.20
    assert visit_data["vaccinations_due"] == "TT-2"
    assert visit_data["next_visit_date"] == "2026-12-10"

    # Verify that an automatic follow-up record was scheduled
    fup_res = client.get(f"/api/v1/followups?beneficiary_id={test_id}")
    assert fup_res.status_code == 200
    fups = fup_res.json()
    assert len(fups) >= 1
    assert fups[0]["due_date"] == "2026-12-10"
    assert fups[0]["status"] == "pending"

    # Mark followup as completed
    fup_id = fups[0]["followup_id"]
    update_res = client.put(f"/api/v1/followups/{fup_id}/status", json={"status": "completed"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "completed"

def test_safety_alerts_endpoint():
    res = client.get("/api/v1/safety/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    assert alerts[0]["rule_id"] == "HBNC-NB-001"
    assert alerts[0]["referral_status"] == "IMMEDIATE_PHC_REFERRAL"
