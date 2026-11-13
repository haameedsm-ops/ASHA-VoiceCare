import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.voice_event import ClientAction, ServerEvent

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "/ws/voice-register" in data["voice_websocket"]

def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gnani_platform" in data
    assert len(data["mandatory_fields_enforced"]) == 5
    assert "beneficiary_id" in data["mandatory_fields_enforced"]

def test_websocket_voice_flow():
    with client.websocket_connect("/ws/voice-register") as ws:
        # Step 1: Initial connection handshake
        init_data = ws.receive_json()
        assert init_data["event"] == ServerEvent.SESSION_INITIALIZED
        session_id = init_data["session_id"]
        assert session_id.startswith("sess_")

        # Step 2: Start session for beneficiary 102
        ws.send_json({
            "action": ClientAction.START_SESSION,
            "language": "hi-IN",
            "beneficiary_id": "102"
        })
        start_ack = ws.receive_json()
        assert start_ack["event"] == ServerEvent.SESSION_INITIALIZED

        # Step 3: Stream PCM binary chunks
        sample_pcm_chunk = b"\x00\x00" * 320 # 320 samples of 16-bit silence
        for _ in range(10):
            ws.send_bytes(sample_pcm_chunk)
        
        # Expect interim transcript notification on 10th chunk
        interim = ws.receive_json()
        assert interim["event"] == ServerEvent.INTERIM_TRANSCRIPT

        # Step 4: Stop stream & trigger extraction
        ws.send_json({
            "action": ClientAction.STOP_STREAM
        })

        # Expect final transcript
        final_tx = ws.receive_json()
        assert final_tx["event"] == ServerEvent.FINAL_TRANSCRIPT
        assert final_tx["is_final"] is True

        # Expect 5 mandatory fields extracted
        extracted_msg = ws.receive_json()
        assert extracted_msg["event"] == ServerEvent.FIELDS_EXTRACTED
        extracted = extracted_msg["extracted_data"]
        assert extracted["beneficiary_id"] == "BEN-102"
        assert extracted["visit_type"] == "Newborn Home Visit (HBNC)"
        assert extracted["weight"] == 2.80
        assert extracted["vaccinations_due"] == "BCG, OPV-0"
        assert extracted["next_visit_date"] == "2026-12-15"

        # Expect spoken read-back prompt event
        readback_msg = ws.receive_json()
        assert readback_msg["event"] == ServerEvent.READBACK_READY
        assert "weight 2.8" in readback_msg["readback_text"]

        # Step 5: Test Barge-in interruption
        ws.send_json({
            "action": ClientAction.BARGE_IN
        })
        barge_ack = ws.receive_json()
        assert barge_ack["event"] == ServerEvent.BARGE_IN_CONFIRMED

        # Step 6: Test Field Correction
        ws.send_json({
            "action": ClientAction.CORRECT_FIELD,
            "corrected_field": "weight",
            "corrected_value": "3.10"
        })
        corrected_msg = ws.receive_json()
        assert corrected_msg["event"] == ServerEvent.FIELDS_EXTRACTED
        assert corrected_msg["extracted_data"]["weight"] == 3.10

        # Step 7: Confirm and Save record
        ws.send_json({
            "action": ClientAction.CONFIRM_RECORD
        })
        save_msg = ws.receive_json()
        assert save_msg["event"] == ServerEvent.RECORD_SAVED
