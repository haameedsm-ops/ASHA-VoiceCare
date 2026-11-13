# ASHA VoiceCare
## AI-Powered Voice Field Register for ASHA Workers

**Hackathon:** Gnani Voice Hackathon  
**Problem Statement:** PS1 – Healthcare  
**Product Type:** Multilingual Voice AI Application  
**Development Environment:** Google Antigravity  
**Development Status:** Under Development

**Tagline:** Your Voice. Every Visit. Every Record.

---

# 1. Product Overview

ASHA VoiceCare is a voice-first digital documentation assistant designed for ASHA (Accredited Social Health Activist) workers who conduct household healthcare visits.

The application converts spoken home-visit notes into structured digital records without requiring manual typing.

An ASHA worker can speak naturally in a supported Indic language with English code-mixing. The system processes the speech, extracts relevant visit information, reads the structured information aloud and allows the worker to correct mistakes before confirming and saving the record.

A separate rule-based safety engine identifies predefined healthcare danger signs and generates appropriate PHC referral flags based on a cited public-health guideline.

The application aims to reduce documentation effort, improve record completeness and make field documentation more accessible.

# 2. Problem Statement

ASHA workers regularly document pregnancy, newborn and immunisation visits using paper registers and mobile applications.

Existing documentation methods create challenges:

- Manual typing consumes time during household visits.
- Small mobile screens make data entry inconvenient.
- Local-language speech mixed with English health terminology is difficult to process accurately.
- Names, numbers, dates and medical terminology can be misunderstood.
- Background noise affects speech recognition.
- Incomplete records can make follow-up management difficult.

**Our solution:** A real-time multilingual voice agent that transforms spoken healthcare visit notes into accurate, verified and structured digital records.

# 3. Product Objectives

1. Enable voice-first healthcare documentation.
2. Support Indic-language speech with English code-mixing.
3. Provide real-time speech recognition.
4. Extract structured information from natural conversations.
5. Read extracted information aloud for verification.
6. Allow spoken corrections and interruptions.
7. Save records only after confirmation.
8. Identify predefined danger signs through independent rules.
9. Maintain follow-up and vaccination information.
10. Work on a mobile device or supported browser.

# 4. Target Users

**Primary user:** ASHA community health worker.

User requirements:
- Minimal typing.
- Simple mobile interface.
- Local-language voice interaction.
- Accurate names and numbers.
- Easy correction of mistakes.
- Quick access to previous records.
- Clear follow-up and referral information.

**Secondary stakeholders:** PHC staff and community healthcare supervisors, as potential future users.

# 5. Core Application Modules

## Module 1: Authentication and Dashboard

Features:
- User login.
- ASHA worker dashboard.
- Total beneficiary count.
- Recent visit records.
- Upcoming follow-ups.
- Pending vaccination reminders.
- Referral alert summary.

Use synthetic beneficiary information for the hackathon.

## Module 2: Beneficiary Management

Features:
- Add a beneficiary.
- Generate or assign a synthetic beneficiary ID.
- Store basic beneficiary information.
- Search by beneficiary ID.
- View previous visit records.

## Module 3: Voice Documentation

This is the primary module.

Features:
- Start and stop voice interaction.
- Capture microphone audio.
- Stream audio through WebSockets.
- Process speech using Gnani Prisma v3.0.
- Display partial transcription.
- Support the selected Indic language and English code-mix.
- Detect speech completion.
- Handle interruptions and recoverable connection errors.

## Module 4: Intelligent Information Extraction

Convert the spoken notes into a structured visit record.

Mandatory fields:

1. Beneficiary ID.
2. Visit type.
3. Weight.
4. Vaccinations due.
5. Next visit date.

Additional fields:
- Visit notes.
- Age, if available.
- Relevant maternal health observations.
- Newborn observations.
- IFA adherence notes, if mentioned.

Requirements:
- Extract only information supported by the conversation.
- Do not invent missing values.
- Validate numbers and dates.
- Ask clarification questions when information is unclear.
- Maintain the context of the current visit.

## Module 5: Voice Read-Back and Confirmation

After extraction, the application must read the important fields aloud using Gnani Timbre v3.0.

Example:

ASHA worker:
"Today I visited beneficiary 102. Weight is 2.8 kilograms. Next visit is on 15 December."

Agent:
"I recorded beneficiary 102, visit type newborn visit, weight 2.8 kilograms and next visit 15 December. Is this correct?"

ASHA worker:
"Yes, save it."

Agent:
"Your visit record has been saved successfully."

If the worker corrects a value:
- Identify the field being corrected.
- Update the value.
- Read back the updated information.
- Ask for confirmation again.

## Module 6: Barge-In and Conversation Management

The worker must be able to interrupt the agent during speech playback.

Expected behaviour:
- Stop current TTS playback.
- Listen to the new user utterance.
- Process the correction or new instruction.
- Update the conversation state.
- Resume the appropriate workflow.

## Module 7: Danger-Sign Safety Engine

Create a separate deterministic rule-based module.

Requirements:
- Maintain a danger-sign list derived from an appropriate public-health guideline.
- Identify predefined signs in the extracted visit information.
- Generate a referral flag when a configured rule matches.
- Display the reason for the alert.
- Provide an appropriate PHC referral instruction.
- Record which rule triggered the alert.

Restrictions:
- No autonomous diagnosis.
- No medication recommendations.
- No treatment advice.
- No LLM-only clinical decisions.
- All rules must be traceable to the cited guideline.

## Module 8: Follow-Up Management

Features:
- Display upcoming visits.
- Track vaccination due information.
- Maintain next-visit dates.
- Mark follow-ups as pending or completed.
- Link follow-ups to beneficiary records.

## Module 9: Visit History

Features:
- View saved records.
- Search by beneficiary ID.
- Display visit date and type.
- Display extracted information.
- Display confirmation status.
- Display associated safety alerts.

# 6. Technology Stack

| Layer | Technology |
|---|---|
| Development environment | Google Antigravity |
| Frontend | React + Vite |
| Styling | CSS / Tailwind CSS |
| Backend | Python FastAPI |
| Real-time communication | WebSockets |
| Speech-to-text | Gnani Prisma v3.0 |
| Text-to-speech | Gnani Timbre v3.0 |
| LLM | Open-choice model |
| Agent orchestration | Custom Python logic |
| Data extraction | Structured JSON |
| Validation | Python |
| Safety engine | Python rule-based logic |
| Database | PostgreSQL / Supabase |
| API testing | Postman |
| Version control | Git and GitHub |

The core voice-agent orchestration must remain controlled by the team's own application. Do not replace it with a hosted end-to-end agent platform.

# 7. System Architecture

The application must follow this architecture:

1. ASHA worker interacts with the React frontend.
2. Frontend captures microphone audio.
3. Audio is streamed to the FastAPI backend using WebSockets.
4. Backend connects to Gnani Prisma v3.0.
5. Streaming speech is converted into text.
6. The custom agent core processes the transcription.
7. The LLM extracts structured visit information.
8. The validation engine checks mandatory fields.
9. The independent safety engine checks predefined danger signs.
10. Gnani Timbre v3.0 generates spoken read-back.
11. Worker confirms or corrects information.
12. Confirmed information is saved in PostgreSQL.
13. Follow-up information is displayed on the dashboard.

# 8. Database Design

## Table 1: beneficiaries

- beneficiary_id — Primary key.
- name.
- age.
- created_at.

## Table 2: visits

- visit_id — Primary key.
- beneficiary_id — Foreign key.
- visit_type.
- weight.
- vaccinations_due.
- next_visit_date.
- visit_notes.
- transcript.
- confirmation_status.
- created_at.

## Table 3: safety_alerts

- alert_id — Primary key.
- visit_id — Foreign key.
- rule_id.
- trigger_reason.
- referral_status.
- created_at.

## Table 4: followups

- followup_id — Primary key.
- beneficiary_id — Foreign key.
- visit_id — Foreign key.
- due_date.
- followup_type.
- status.

Use synthetic data only in the hackathon prototype.

# 9. Frontend Requirements

Create a professional mobile-first interface.

### Page 1: Login

Simple authentication screen for the ASHA worker.

### Page 2: Dashboard

Display:
- Total beneficiaries.
- Visits completed.
- Upcoming follow-ups.
- Pending vaccination information.
- Active referral flags.

### Page 3: Beneficiary Management

Display a searchable list of synthetic beneficiaries with add and view options.

### Page 4: Voice Assistant

This is the main screen.

Include:
- Large microphone button.
- Live waveform animation.
- Recording indicator.
- Live transcription.
- Agent response status.
- Language selection.
- Stop and interrupt controls.

### Page 5: Visit Verification

Display the five required fields in editable cards.

Include:
- Edit field.
- Confirm record.
- Correct through voice.
- Save record.

### Page 6: Visit History

Display saved visit records with beneficiary IDs, visit dates and visit types.

### Page 7: Follow-Up Dashboard

Display upcoming visits, vaccination due information and referral flags.

# 10. Backend Requirements

Use FastAPI with modular structure.

Responsibilities:
- API routing.
- Authentication.
- WebSocket communication.
- Gnani API integration.
- Agent orchestration.
- Structured extraction.
- Validation.
- Safety rules.
- Database operations.
- Follow-up management.

Keep external API credentials in environment variables.

# 11. Non-Functional Requirements

### Performance
- Minimise time to first agent audio.
- Display partial transcription.
- Avoid unnecessary LLM calls.
- Measure end-to-end response latency.

### Reliability
- Handle network disconnections.
- Maintain conversation state.
- Prevent duplicate records.
- Preserve unconfirmed information during recoverable errors.

### Usability
- Mobile-first interface.
- Large touch targets.
- Minimal typing.
- Clear feedback.
- Simple voice prompts.

### Security
- Protect API credentials.
- Never expose API keys in frontend code.
- Use synthetic data.
- Protect stored records.
- Use secure communication.

# 12. Testing Requirements

Test the following scenarios:

**Test 1: Normal visit**
- Speak a complete visit note.
- Extract all five mandatory fields.
- Read back the record.
- Confirm and save.

**Test 2: Incorrect value**
- Introduce an incorrect or ambiguous value.
- Correct it through speech.
- Verify the updated field.
- Confirm and save.

**Test 3: Code-mixing**
- Speak in the selected Indic language with English health terminology.
- Check transcription and extraction accuracy.

**Test 4: Background noise**
- Test under different simulated household and street noise conditions.

**Test 5: Barge-in**
- Interrupt the agent while it is speaking.
- Verify that playback stops and the new instruction is processed.

**Test 6: Danger-sign escalation**
- Use a synthetic test note containing a predefined danger sign.
- Verify the correct rule is triggered.
- Verify the referral alert.
- Test a negative example as well.

# 13. Hackathon Evaluation Metrics

Measure:
- Task completion rate.
- Field extraction accuracy.
- Name recognition accuracy.
- Number recognition accuracy.
- Time to first agent audio.
- Barge-in success rate.
- Endpointing performance.
- Danger-sign detection sensitivity.
- False-positive rate.
- Successful record persistence.

Do not invent results. Display actual measured results only.

# 14. Implementation Phases

Phase 1: React frontend and application layout.

Phase 2: FastAPI backend and database.

Phase 3: Gnani Prisma v3.0 integration.

Phase 4: Gnani Timbre v3.0 integration.

Phase 5: WebSocket-based streaming and custom agent orchestration.

Phase 6: Structured extraction and voice confirmation.

Phase 7: Barge-in and correction handling.

Phase 8: Safety rules and follow-up system.

Phase 9: Testing, performance measurement and final demo.

# 15. Definition of Done

The prototype is ready for demonstration when:

- The application can capture live microphone audio.
- Gnani Prisma v3.0 processes the streaming speech.
- The custom agent extracts the mandatory fields.
- Gnani Timbre v3.0 reads the information aloud.
- The worker can interrupt and correct the information.
- The safety engine identifies configured danger signs.
- The worker can confirm and save the record.
- Saved information appears in the database.
- The complete workflow works without developer assistance.

# Final Product Vision

ASHA VoiceCare transforms healthcare field documentation from repetitive manual entry into an accessible, multilingual voice-driven workflow.

**Less time documenting. More time supporting rural families.**