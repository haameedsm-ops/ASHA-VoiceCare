import json
import uuid
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.voice_event import (
    ClientAction,
    ServerEvent,
    VoiceServerMessage,
    MandatoryVisitFields
)
from app.services.gnani_prisma import GnaniPrismaClient
from app.services.agent_orchestrator import AgentOrchestrator, OrchestratorState

router = APIRouter()

active_sessions: Dict[str, Dict] = {}

@router.websocket("/ws/voice-register")
async def voice_register_websocket(websocket: WebSocket):
    await websocket.accept()
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    prisma_client = GnaniPrismaClient()
    orchestrator = AgentOrchestrator(session_id=session_id)

    active_sessions[session_id] = {
        "websocket": websocket,
        "prisma_client": prisma_client,
        "orchestrator": orchestrator,
        "pcm_chunks_received": 0,
    }

    try:
        status = prisma_client.get_status()
        init_response = VoiceServerMessage(
            event=ServerEvent.SESSION_INITIALIZED,
            session_id=session_id,
            provider=status.get("provider_name", "GnaniPrisma"),
            provider_status=status.get("status", "SIMULATED"),
            is_simulated=not status.get("is_live", False),
            message=f"Session {session_id} active. Mode: {status['mode']}. Never fabricates fake speech data."
        )
        await websocket.send_text(init_response.model_dump_json())

        while True:
            message = await websocket.receive()

            if "bytes" in message and message["bytes"] is not None:
                # Binary frame: 16kHz 16-bit PCM chunk from frontend Web Audio API
                pcm_chunk = message["bytes"]
                active_sessions[session_id]["pcm_chunks_received"] += 1
                await prisma_client.send_audio_chunk(pcm_chunk)

                chunks = active_sessions[session_id]["pcm_chunks_received"]
                if chunks % 8 == 0:
                    interim = VoiceServerMessage(
                        event=ServerEvent.INTERIM_TRANSCRIPT,
                        session_id=session_id,
                        transcript=f"Streaming audio packets... ({chunks} PCM chunks received)",
                        is_final=False,
                        is_simulated=True
                    )
                    await websocket.send_text(interim.model_dump_json())

            elif "text" in message and message["text"] is not None:
                data = json.loads(message["text"])
                action = data.get("action")

                if action == ClientAction.START_SESSION:
                    lang = data.get("language", "hi-IN")
                    ben_id = data.get("beneficiary_id")
                    orchestrator.language_code = lang
                    orchestrator.beneficiary_id = ben_id
                    orchestrator.start_listening()
                    active_sessions[session_id]["pcm_chunks_received"] = 0

                    await prisma_client.start_stream(language_code=lang, beneficiary_id=ben_id)

                    await websocket.send_text(VoiceServerMessage(
                        event=ServerEvent.SESSION_INITIALIZED,
                        session_id=session_id,
                        provider_status="LISTENING",
                        message=f"Session listening. Language: {lang}, Target: {ben_id or 'General'}"
                    ).model_dump_json())

                elif action == ClientAction.SUBMIT_MANUAL_TRANSCRIPT:
                    # User submitted a manual test input
                    manual_text = data.get("manual_transcript", "").strip()
                    if manual_text:
                        prisma_client.set_manual_transcript(manual_text)
                        await websocket.send_text(VoiceServerMessage(
                            event=ServerEvent.INTERIM_TRANSCRIPT,
                            session_id=session_id,
                            transcript=manual_text,
                            provider="MANUAL TEST INPUT",
                            provider_status="MANUAL_TEST_INPUT",
                            is_simulated=False,
                            message="Manual test transcript queued for processing."
                        ).model_dump_json())

                elif action == ClientAction.STOP_STREAM:
                    stt_result = await prisma_client.finish_stream()
                    final_text = stt_result.get("transcript", "").strip()
                    provider = stt_result.get("provider", "Gnani Prisma")
                    provider_status = stt_result.get("provider_status", "WAITING_FOR_SPEECH")
                    is_simulated = stt_result.get("is_simulated", True)

                    # Send final transcript event with truthful provider and status
                    await websocket.send_text(VoiceServerMessage(
                        event=ServerEvent.FINAL_TRANSCRIPT,
                        session_id=session_id,
                        transcript=final_text,
                        is_final=True,
                        provider=provider,
                        provider_status=provider_status,
                        is_simulated=is_simulated,
                        message=stt_result.get("message", "Stream finalized.")
                    ).model_dump_json())

                    # If no transcript is available (live STT disconnected and no manual test input),
                    # NEVER invent fake visit fields!
                    if not final_text:
                        continue

                    # If a real transcript or manual test input exists, run extraction
                    orch_result = orchestrator.on_transcript_complete(final_text)

                    if orch_result["status"] == "NEEDS_CLARIFICATION":
                        await websocket.send_text(VoiceServerMessage(
                            event=ServerEvent.READBACK_READY,
                            session_id=session_id,
                            readback_text=orch_result["prompt"],
                            provider=provider,
                            message=f"Mandatory field missing: {orch_result['missing_field']}"
                        ).model_dump_json())
                    else:
                        extracted = orch_result["extracted_fields"]
                        safety_alerts = orch_result.get("safety_alerts", [])

                        await websocket.send_text(VoiceServerMessage(
                            event=ServerEvent.FIELDS_EXTRACTED,
                            session_id=session_id,
                            extracted_data=extracted,
                            safety_alerts=safety_alerts,
                            provider=provider,
                            message="Mandatory fields extracted successfully."
                        ).model_dump_json())

                        await websocket.send_text(VoiceServerMessage(
                            event=ServerEvent.READBACK_READY,
                            session_id=session_id,
                            readback_text=orch_result["readback_text"],
                            provider=provider,
                            message="Agent read-back generated. Spoken barge-in enabled."
                        ).model_dump_json())

                elif action == ClientAction.BARGE_IN:
                    orchestrator.handle_barge_in()
                    await websocket.send_text(VoiceServerMessage(
                        event=ServerEvent.BARGE_IN_CONFIRMED,
                        session_id=session_id,
                        message="Playback halted immediately. Listening for spoken correction..."
                    ).model_dump_json())

                elif action == ClientAction.CORRECT_FIELD:
                    correction_phrase = f"{data.get('corrected_field')} is {data.get('corrected_value')}"
                    corr_result = orchestrator.apply_spoken_correction(correction_phrase)

                    await websocket.send_text(VoiceServerMessage(
                        event=ServerEvent.FIELDS_EXTRACTED,
                        session_id=session_id,
                        extracted_data=corr_result["extracted_fields"],
                        readback_text=corr_result["readback_text"],
                        message="Record updated with spoken correction."
                    ).model_dump_json())

                elif action == ClientAction.CONFIRM_RECORD:
                    orchestrator.confirm_and_persist()
                    await websocket.send_text(VoiceServerMessage(
                        event=ServerEvent.RECORD_SAVED,
                        session_id=session_id,
                        message="Visit record confirmed and persisted to register successfully."
                    ).model_dump_json())

    except WebSocketDisconnect:
        if session_id in active_sessions:
            del active_sessions[session_id]
    except Exception as e:
        await websocket.send_text(VoiceServerMessage(
            event=ServerEvent.ERROR,
            session_id=session_id,
            message=str(e)
        ).model_dump_json())
        if session_id in active_sessions:
            del active_sessions[session_id]
