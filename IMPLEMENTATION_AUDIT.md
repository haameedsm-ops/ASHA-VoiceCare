# ASHA VoiceCare: Comprehensive Implementation Audit Report

**Date of Audit:** November 2026  
**Auditor:** Senior Full-Stack Engineer & Voice AI Architect  
**Project:** ASHA VoiceCare (Gnani Voice Hackathon – PS1 Healthcare)  
**Status:** Audit Completed. Pending User Review.  

---

## 1. Executive Audit Summary

This rigorous implementation audit was conducted on the existing codebase to verify the factual status of all 12 implementation phases claimed in the previous report.

### Key Audit Finding
While the architectural foundation, database schema, REST API, deterministic safety engine, and React user interface are genuinely implemented and tested, **the voice AI layer is currently operating in diagnostic simulation mode because live Gnani API credentials and official Gnani endpoint specifications have not yet been configured in the backend environment**. Furthermore, voice transcription currently returns a hardcoded/template visit note rather than real-time speech recognition from the microphone, and TTS read-back uses the browser's built-in Web Speech API rather than Gnani Timbre audio streams.

---

## 2. Gnani Integration Audit (Prisma v3.0 & Timbre v3.0)

### 2.1 Gnani Prisma v3.0 (Streaming STT)
- **Live Connection Status:** ❌ **NOT CONNECTED TO LIVE GNANI API**
- **Current Mode:** `[SIMULATED - PENDING LIVE CREDENTIALS]`
- **Root Cause:** In `backend/.env`, both `GNANI_API_KEY` and `GNANI_ACCESS_TOKEN` are empty strings.
- **Code Inspection (`backend/app/services/gnani_prisma.py`):**
  - Line 22: `self.is_live = GnaniSimulatorService.is_configured(self.api_key, self.access_token)` evaluates to `False`.
  - Line 59: `send_audio_chunk()` silently ignores audio chunks because `self.is_live` is `False`. Raw PCM audio streamed from the browser is discarded.
  - Lines 77–91: `finish_stream()` returns a **hardcoded synthetic template transcript**:
    ```python
    f"Today I visited beneficiary {ben_num}. Baby weight is 2.8 kilograms. Vaccinations due are BCG and OPV zero. Next visit scheduled on 15 December. Baby is feeding well at breast, no fever, cord stump dry."
    ```
    Regardless of what the user speaks into the microphone, this static text is always returned.
  - Lines 38–52: The outbound WebSocket connection code to `wss://api.gnani.ai/prisma/v3/stream` is speculative. The JSON handshake structure (`{"config": {"encoding": "LINEAR16", ...}}`) has **not been verified against official Gnani Prisma v3.0 documentation** because official documentation was not provided in the project repository.

### 2.2 Gnani Timbre v3.0 (TTS Synthesis)
- **Live Connection Status:** ❌ **NOT CONNECTED TO LIVE GNANI API**
- **Current Mode:** `[SIMULATED - PENDING LIVE CREDENTIALS]`
- **Code Inspection (`backend/app/services/gnani_timbre.py`):**
  - Line 20: `self.is_live` evaluates to `False`.
  - Lines 83–91: `synthesize_speech()` calls `_generate_dummy_wav()`, which generates **1.5 seconds of pure digital silence** (`b'\x00\x00' * num_samples`) with a 44-byte WAV header.
  - Lines 60–75: The live REST call to `https://api.gnani.ai/timbre/v3/synthesize` is speculative and has not been executed against a real Gnani server.
- **Frontend Playback Inspection (`frontend/src/services/voiceSocket.js`):**
  - Lines 98–106: Audio read-back is executed via `window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))` using the client's local operating system speech synthesizer, **not Gnani Timbre audio**.

---

## 3. Live Voice Pipeline Audit

| Pipeline Stage | Implementation Status | Technical Mechanism & Evidence |
|---|---|---|
| **Microphone Capture** | ✅ **Real Implementation** | Uses browser `navigator.mediaDevices.getUserMedia({ audio: true })`. `AudioContext` and `ScriptProcessorNode` capture live microphone input and downsample to 16,000 Hz 16-bit Mono Linear PCM. |
| **Canvas Waveform** | ✅ **Real Implementation** | `WaveformVisualizer.jsx` binds to `AnalyserNode` and draws real-time oscilloscope waves driven by ambient microphone volume. |
| **WebSocket Audio Streaming** | ✅ **Real Implementation** | `voiceSocket.js` sends raw binary ArrayBuffers of 16kHz PCM chunks over `ws://localhost:8000/ws/voice-register`. The backend receives and counts binary frames. |
| **Interim Transcription** | ⚠️ **Simulated** | Backend emits `Streaming speech... (X PCM packets received)` every 8 chunks instead of streaming interim recognized words. |
| **Final Transcription** | ⚠️ **Hardcoded / Simulated** | In simulation mode, `prisma_client.finish_stream()` returns a hardcoded visit note rather than transcribing the received audio packets. |
| **TTS Generation & Playback** | ⚠️ **Browser Synthesis Fallback** | Text read-back is vocalized using browser Web Speech API (`SpeechSynthesisUtterance`), not Gnani Timbre audio bytes. |

---

## 4. Barge-In & Spoken Correction Audit

### 4.1 Playback Interruption Latency
- **Browser Playback Cancellation:** ✅ **Genuinely Interrupted**  
  Calling `voiceSocket.triggerBargeIn()` executes `window.speechSynthesis.cancel()`, which halts browser audio playback immediately (<50ms).
- **Backend Orchestrator Interruption:** ✅ **Genuinely Handled**  
  The backend orchestrator transitions state from `READING_BACK` to `LISTENING`.

### 4.2 Spoken Interruption Detection (Voice Activity Detection - VAD)
- ❌ **NOT IMPLEMENTED:** When the agent is speaking (`voiceState === 'SPEAKING'`), the microphone stream is **stopped** (`recorderRef.current.stop()`). The application does **not** listen to incoming microphone audio while speaking; it cannot detect spoken interruptions autonomously.
- **Current Trigger:** Barge-in is only triggered when the user **manually taps** the "Interrupt / Barge-In" button or "Speak Correction" button on screen.
- **Spoken Correction Processing:**  
  In `VoiceAssistantPage.jsx` (line 144), tapping Interrupt executes:
  ```javascript
  setTranscript((prev) => prev + ' [CORRECTION]: Baby weight is actually 3.10 kilograms.');
  setExtractedData({ ...extractedData, weight: 3.10 });
  ```
  This is a **hardcoded simulation** that appends a static string and forces the weight to 3.10 kg, rather than listening to and transcribing the user's spoken correction.

---

## 5. Database & Persistence Audit

- **Engine & Storage:** Async SQLAlchemy 2.0 with SQLite (`asha_voicecare.db`) locally, fully compatible with PostgreSQL / Supabase via `DATABASE_URL`.
- **Database File Inspection (`asha_voicecare.db`):**
  - `beneficiaries`: 9 records present.
  - `visits`: 6 records present.
  - `safety_alerts`: 1 record present.
  - `followups`: 6 records present.
- **Data Integrity & Constraints:**
  - Foreign key constraints link `visits.beneficiary_id -> beneficiaries.beneficiary_id`, `safety_alerts.visit_id -> visits.visit_id`, and `followups.visit_id -> visits.visit_id`.
  - Duplicate beneficiary prevention is enforced in `POST /api/v1/beneficiaries` (returns 400 Bad Request on duplicate ID).
  - Saving a verified visit automatically schedules a corresponding `followup` record for `next_visit_date`.
- **Status:** ✅ **100% Genuinely Implemented and Verified**.

---

## 6. Safety Rules Engine Audit

- **Location:** `backend/app/safety/rules_engine.py` and `backend/app/safety/guidelines.py`.
- **Design:** Pure deterministic Python regex and numeric comparison logic. **Zero LLM involvement.**
- **Rule Traceability Verification:**
  1. `HBNC-NB-001` (Weight < 2.0 kg): Traceable to *MoHFW HBNC Guidelines (Modules 6 & 7)*. Triggers `IMMEDIATE_PHC_REFERRAL`.
  2. `HBNC-NB-002` (Weight < 1.8 kg): Traceable to *IMNCI Neonatal Guidelines (Table 1)*. Triggers `EMERGENCY_SNCU_REFERRAL`.
  3. `HBNC-NB-003` (Hypothermia / Fever): Traceable to *MoHFW HBNC Home Visit Checklist*. Triggers `URGENT_PHC_REFERRAL`. Negation guard (`no fever`, `बुखार नहीं`) prevents false positives.
  4. `HBNC-NB-004` (Poor Feeding): Traceable to *IMNCI Neonatal Danger Signs*. Triggers `URGENT_PHC_REFERRAL`.
  5. `HBNC-NB-005` (Fast Breathing / Chest Indrawing): Traceable to *IMNCI Acute Respiratory Infection Guidelines*. Triggers `URGENT_PHC_REFERRAL`.
  6. `HBNC-ANC-006` (Maternal Pre-Eclampsia): Traceable to *MoHFW ANC Protocol / PMSMA*. Triggers `URGENT_ANC_REFERRAL`.
  7. `HBNC-ANC-007` (Vaginal Bleeding): Traceable to *MoHFW Maternal Health Obstetric Emergency Guidelines*. Triggers `EMERGENCY_MOH_REFERRAL`.
- **Clinical Safety Restrictions:**
  - No autonomous medical diagnosis is provided.
  - No medications or drug dosages are recommended.
  - Actions are restricted to referral directives (e.g. transfer to PHC/SNCU, Kangaroo Mother Care, keeping baby warm).
- **Status:** ✅ **100% Genuinely Implemented, Fully Compliant with PRD Module 7**.

---

## 7. Testing Audit & Metrics Verification

### 7.1 Backend Pytest Suite
Ran `$env:PYTHONPATH="backend"; python -m pytest backend/tests/ -v`:
- **Result:** **25 passed, 1 warning in 4.14 seconds.**
- **Test Categorization:**
  - `test_database.py` (4 tests): **Real integration tests** executing real SQL statements against `asha_voicecare.db`.
  - `test_safety_engine.py` (5 tests): **Real unit tests** validating deterministic clinical rules and negation handling.
  - `test_extraction.py` (4 tests): **Real unit tests** evaluating regex/NLP extraction on multilingual Indic/English text strings.
  - `test_agent_orchestrator.py` (3 tests): **Real unit tests** of the state machine transitions and clarification loops.
  - `test_api.py` (3 tests): **Real integration tests** via FastAPI TestClient verifying HTTP endpoints and WebSocket protocol handshakes.
  - `test_gnani_prisma.py` (3 tests): ⚠️ **Simulated tests**. They test the client adapter code, but against the mock/simulator fallback because live credentials are unset.
  - `test_gnani_timbre.py` (3 tests): ⚠️ **Simulated tests**. Validates WAV header generation and script formatting, not a live Gnani TTS API response.

### 7.2 Evaluation Script (`scripts/run_evaluation_suite.py`)
Ran `$env:PYTHONPATH="backend"; python scripts/run_evaluation_suite.py`:
- **Reported 100% Task Completion Rate (6/6 scenarios passed).**
- **Audit Nuance:**
  - Scenario 1, 3, 4, 6 test the real extraction and safety engine against text transcripts.
  - Scenario 5 ("Barge-in halt latency: 0.003 ms") measured the time to execute a Python dictionary assignment `orch_barge.handle_barge_in()` in RAM. It did **not** measure acoustic interruption latency or speech-to-text cancellation over the network.

---

## 8. Frontend User Interface Audit

- **Build Integrity:** `npm run build` transforms 2,120 modules and outputs a clean bundle with **zero syntax or compilation errors**.
- **Page Coverage (7 Screens):**
  1. `LoginPage.jsx`: Working field authentication screen with PIN entry and sub-centre branding.
  2. `DashboardPage.jsx`: Working metric tiles, recent visit cards, active referral alert feed, and quick voice visit action.
  3. `BeneficiaryPage.jsx`: Working search filter, category tabs (`ANC`, `Newborn`, `PNC`, `Child`), Add Beneficiary modal, and Beneficiary Detail modal with visit history.
  4. `VoiceAssistantPage.jsx`: Working Web Audio API visualizer, 16kHz PCM streaming, state transitions, and transcript container.
  5. `VerificationPage.jsx`: Working editable 5 mandatory field cards, safety alert referral banner, manual edit modal, and spoken correction modal.
  6. `HistoryPage.jsx`: Working filterable digital audit register of confirmed home visits.
  7. `FollowupPage.jsx`: Working schedule of upcoming visits and pending immunisations with "Mark Completed" toggle.
- **Design Compliance:** Matches all visual requirements: white backgrounds (`#FFFFFF`), navy typography (`#0A192F`), pale-blue cards (`#F0F7FF`), and royal-blue accents (`#1D4ED8`). Responsive on mobile and desktop.

---

## 9. Comprehensive Feature Classification Matrix

| Feature | Actual Status | Classification |
|---|---|---|
| Responsive Mobile-First Healthcare UI | Functional | **Verified Working** |
| 7 Screen Navigation & State Transitions | Functional | **Verified Working** |
| Beneficiary Management (Add, Search, View History) | Functional | **Verified Working** |
| Database Persistence (4 Tables, Relationships) | Functional | **Verified Working** |
| Mandatory 5-Field Validation Engine | Functional | **Verified Working** |
| Deterministic MoHFW HBNC/IMNCI Safety Engine | Functional | **Verified Working** |
| Microphone Audio Capture (16kHz PCM) | Functional | **Verified Working** |
| Audio Waveform Visualization (Canvas Analyser) | Functional | **Verified Working** |
| WebSocket Frame Streaming to Backend | Functional | **Verified Working** |
| Browser Playback Stop on Button Tap | Functional | **Verified Working** |
| Live Gnani Prisma v3.0 STT Connection | Inactive | **Requires Gnani Credentials & Docs** |
| Live Speech-to-Text from User Voice | Inactive | **Simulated (Returns Template Note)** |
| Live Gnani Timbre v3.0 TTS Connection | Inactive | **Requires Gnani Credentials & Docs** |
| TTS Audio Streaming & Playback | Fallback | **Simulated via Browser Web Speech API** |
| Autonomous Voice-Activated Barge-In (VAD) | Inactive | **Simulated (Requires Button Click)** |
| Spoken Correction Audio Processing | Inactive | **Simulated (Hardcoded String)** |

---

## 10. Critical Bugs & Technical Debt Identified

1. **Hardcoded Transcript on Voice Recording:** In `backend/app/services/gnani_prisma.py` (lines 78-91) and `frontend/src/pages/VoiceAssistantPage.jsx` (lines 103-106, 121-135), the transcript text is hardcoded to a template note about beneficiary 102. Speaking something different into the mic does not alter the transcribed text.
2. **Missing Voice Activity Detection (VAD) for Barge-in:** When the agent speaks, the microphone is turned off. A user cannot interrupt by simply speaking; they must physically tap the "Interrupt" button.
3. **Hardcoded Spoken Correction:** In `VoiceAssistantPage.jsx` (line 144), tapping interrupt automatically forces `weight: 3.10 kg` without listening to the user's actual spoken correction.
4. **Browser Web Speech API used instead of Gnani Timbre:** `voiceSocket.js` uses `window.speechSynthesis` instead of receiving and playing back audio stream bytes from the backend TTS service.
5. **Speculative Gnani Endpoint Contracts:** Without official Gnani documentation in the repository, the WebSocket handshake for Prisma v3.0 and REST body for Timbre v3.0 are based on generic assumptions rather than confirmed specifications.

---

## 11. Remaining Work Before Hackathon Demonstration

To transition ASHA VoiceCare from a simulated demonstration prototype into a genuine live voice AI application:

1. **Obtain Official Gnani Documentation & Credentials:**
   - Specific streaming WebSocket endpoint URL and authentication header format for Gnani Prisma v3.0.
   - Specific HTTP REST endpoint URL and payload schema for Gnani Timbre v3.0.
   - Insert live `GNANI_API_KEY` and `GNANI_ACCESS_TOKEN` into `backend/.env`.
2. **Wire Real STT Tokens to Frontend:**
   - Update `gnani_prisma.py` to stream live recognized words from the Gnani WebSocket into `voice_stream.py` and display them dynamically in the frontend transcript box.
3. **Implement Full-Duplex Audio or Continuous VAD for Hands-Free Barge-In:**
   - Keep the microphone stream open during playback with client-side energy/VAD threshold detection so speaking *"Wait"* or *"Stop"* halts playback automatically without requiring a screen tap.
4. **Stream Gnani Timbre Audio Bytes to Frontend:**
   - Have the backend send synthesized WAV/MP3 audio chunks over WebSocket to the frontend and play them using an `AudioContext` buffer rather than browser speech synthesis.
5. **Dynamic Spoken Correction Loop:**
   - Allow the user to speak their correction (e.g. *"Actually weight is 3.4 kg"*), pipe that audio chunk through Prisma STT, re-run `StructuredInformationExtractor`, and dynamically update whichever field was spoken.
