# ASHA VoiceCare

**AI-Powered Voice Field Register for ASHA Workers**  
*Gnani Voice Hackathon – PS1 Healthcare*

---

## 🌟 Overview

**ASHA VoiceCare** is a dedicated voice-first field register designed for Accredited Social Health Activists (ASHA workers) conducting maternal, newborn, and child health home visits in rural and semi-urban India.

The application captures natural, spoken home-visit notes in Indic languages with English code-mixing (e.g. Hindi, Kannada, Telugu + English medical terminology), performs real-time speech recognition via **Gnani Prisma v3.0**, validates mandatory fields, evaluates clinical danger signs via an **independent deterministic safety engine**, synthesizes spoken verification read-back via **Gnani Timbre v3.0**, handles spoken corrections and barge-in interruptions, and persists verified records into **PostgreSQL / Supabase**.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Web Audio API (16kHz PCM streaming)
- **Backend:** Python FastAPI, WebSockets, Pydantic, SQLAlchemy 2.0 (asyncio)
- **Voice AI:** Gnani Prisma v3.0 (STT), Gnani Timbre v3.0 (TTS)
- **Clinical Safety:** Independent rule-based engine derived from MoHFW HBNC and IMNCI guidelines
- **Database:** PostgreSQL / Supabase (with SQLite fallback for local development)

---

## 📋 Five Mandatory Fields

Every home visit record enforces complete capture and verification of:
1. **Beneficiary ID** (e.g. `BEN-102`)
2. **Visit Type** (e.g. `Newborn Home Visit`, `ANC`, `PNC`)
3. **Weight** (e.g. `2.80 kg`)
4. **Vaccinations Due** (e.g. `BCG, OPV-0` or `None`)
5. **Next Visit Date** (e.g. `2026-12-15`)

---

## 🚀 Running the Application

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
