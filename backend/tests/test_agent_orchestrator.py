import pytest
from app.services.agent_orchestrator import AgentOrchestrator, OrchestratorState

def test_orchestrator_normal_visit_flow():
    orchestrator = AgentOrchestrator(session_id="test_sess_01", beneficiary_id="BEN-102")
    assert orchestrator.state == OrchestratorState.IDLE

    # 1. Start listening
    orchestrator.start_listening()
    assert orchestrator.state == OrchestratorState.LISTENING

    # 2. Complete transcript
    note = "Beneficiary 102 home visit. Weight is 2.8 kilograms. BCG due. Next visit 2026-12-15."
    res = orchestrator.on_transcript_complete(note)
    assert res["status"] == "READY_FOR_READBACK"
    assert orchestrator.state == OrchestratorState.READING_BACK
    assert "2.8 kilograms" in res["readback_text"]
    assert "2026-12-15" in res["readback_text"]

    # 3. Confirm and persist
    confirm_res = orchestrator.confirm_and_persist()
    assert confirm_res["status"] == "CONFIRMED"
    assert orchestrator.state == OrchestratorState.RECORD_SAVED

def test_orchestrator_clarification_loop():
    orchestrator = AgentOrchestrator(session_id="test_sess_02")
    orchestrator.start_listening()

    # Note with missing weight
    note = "Beneficiary 102 newborn visit. Next visit 2026-12-15. Vaccinations BCG."
    res = orchestrator.on_transcript_complete(note)
    assert res["status"] == "NEEDS_CLARIFICATION"
    assert res["missing_field"] == "weight"
    assert orchestrator.state == OrchestratorState.ASKING_CLARIFICATION
    assert "weight" in res["prompt"].lower()

def test_orchestrator_barge_in_and_correction():
    orchestrator = AgentOrchestrator(session_id="test_sess_03")
    orchestrator.start_listening()
    note = "Beneficiary 102 newborn visit. Weight is 2.8 kilograms. Next visit 2026-12-15. BCG due."
    orchestrator.on_transcript_complete(note)
    assert orchestrator.state == OrchestratorState.READING_BACK

    # Worker interrupts during TTS playback
    barge_res = orchestrator.handle_barge_in()
    assert barge_res["status"] == "BARGE_IN_PROCESSED"
    assert orchestrator.state == OrchestratorState.LISTENING

    # Worker speaks correction: "Wait, weight is 3.10 kg"
    corr_res = orchestrator.apply_spoken_correction("Wait, weight is 3.10 kg")
    assert corr_res["status"] == "CORRECTION_APPLIED"
    assert corr_res["extracted_fields"].weight == 3.10
    assert "3.1 kilograms" in corr_res["readback_text"]
    assert orchestrator.state == OrchestratorState.READING_BACK
