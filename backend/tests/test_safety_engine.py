import pytest
from app.schemas.voice_event import MandatoryVisitFields
from app.safety.rules_engine import SafetyRulesEngine

def test_safety_engine_low_birth_weight():
    engine = SafetyRulesEngine()
    fields = MandatoryVisitFields(
        beneficiary_id="BEN-104",
        visit_type="Newborn Home Visit (HBNC)",
        weight=1.95,
        vaccinations_due="BCG, OPV-0",
        next_visit_date="2026-11-14",
        visit_notes="Baby born small. Needs care."
    )
    alerts = engine.evaluate(fields)
    assert len(alerts) == 1
    assert alerts[0]["rule_id"] == "HBNC-NB-001"
    assert alerts[0]["severity"] == "IMMEDIATE_PHC_REFERRAL"
    assert "MoHFW HBNC" in alerts[0]["guideline_source"]

def test_safety_engine_very_low_birth_weight():
    engine = SafetyRulesEngine()
    fields = MandatoryVisitFields(
        beneficiary_id="BEN-109",
        visit_type="Newborn Home Visit (HBNC)",
        weight=1.65,
        vaccinations_due="None",
        next_visit_date="2026-11-14",
        visit_notes="Premature birth."
    )
    alerts = engine.evaluate(fields)
    assert len(alerts) == 1
    assert alerts[0]["rule_id"] == "HBNC-NB-002"
    assert alerts[0]["severity"] == "EMERGENCY_SNCU_REFERRAL"

def test_safety_engine_poor_feeding():
    engine = SafetyRulesEngine()
    fields = MandatoryVisitFields(
        beneficiary_id="BEN-102",
        visit_type="Newborn Home Visit",
        weight=2.5,
        vaccinations_due="BCG",
        next_visit_date="2026-11-20",
        visit_notes="Baby is weak and unable to feed at breast."
    )
    alerts = engine.evaluate(fields)
    assert any(a["rule_id"] == "HBNC-NB-004" for a in alerts)

def test_safety_engine_maternal_pre_eclampsia():
    engine = SafetyRulesEngine()
    fields = MandatoryVisitFields(
        beneficiary_id="BEN-101",
        visit_type="ANC Home Visit",
        weight=55.0,
        vaccinations_due="TT-2",
        next_visit_date="2026-11-20",
        visit_notes="Mother complains of severe headache and blurred vision. High BP."
    )
    alerts = engine.evaluate(fields)
    assert any(a["rule_id"] == "HBNC-ANC-006" for a in alerts)

def test_safety_engine_normal_visit_zero_false_positives():
    engine = SafetyRulesEngine()
    fields = MandatoryVisitFields(
        beneficiary_id="BEN-102",
        visit_type="Newborn Home Visit",
        weight=2.85,
        vaccinations_due="BCG, OPV-0",
        next_visit_date="2026-12-15",
        visit_notes="Baby feeding well at breast, no fever, umbilical cord clean."
    )
    alerts = engine.evaluate(fields)
    assert len(alerts) == 0 # Clean normal visit must have zero false positives!
