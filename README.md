# NoticeSense AI 🎓📋
> **"Every Notice Understood. Every Deadline Remembered."**
> AI-Powered Campus Notice Intelligence, Grounded Fact Verification, and Student Productivity Platform.

---

## 📌 Problem Statement
College students receive high volumes of unstructured official circulars, emails, and PDFs regarding scholarships, exam registrations, hostel rules, fees, and hackathons. These documents are often:
- Lengthy and dense with bureaucratic phrasing.
- Easy to overlook or misinterpret regarding strict deadlines.
- Ambiguous with unstated years or conflicting fee amounts.

Generic AI chatbots often **hallucinate** or make "confident guesses" about deadlines and fees when information is absent. In college life, a hallucinated deadline can cause a student to forfeit a scholarship or miss a semester registration.

---

## 💡 Solution: Trustworthy AI over Confident Guessing
**NoticeSense AI** is a purpose-built campus document intelligence engine that:
1. **Understands & Extracts**: Parses dates, eligibility criteria, tiered fee schedules, required documents, and instructions.
2. **Two-Phase Verification Engine**: Performs deterministic and semantic checks to verify that every extracted fact is grounded in verbatim source text.
3. **Explicit Uncertainty & Ambiguity Detection**: If a deadline is missing, a year is omitted, or numbers conflict, NoticeSense explicitly flags it rather than guessing.
4. **Grounded Q&A**: Answers student questions strictly from document evidence with negative constraint fallback (*"This information is not stated in the supplied notice"*).
5. **Actionable Task Checklists**: Automatically converts circular instructions into interactive student to-do items.

---

## ✨ Key Features
- 🛡️ **Source-Evidence Highlighting**: Click any extracted deadline, eligibility rule, or fee to view the exact verbatim sentence from the official circular.
- ⏱️ **Deadlines Timeline**: Chronological view with normalized dates, urgency badges, and distinction between submission cutoffs vs event dates.
- 🔍 **Grounded "Ask the Notice"**: Natural language Q&A with one-click suggested questions and negative constraint enforcement against hallucinations.
- ⚡ **Notice Comparison Intelligence**: Side-by-side comparison of two notices to detect revised deadlines, changed fees, and policy conflicts.
- 📝 **Interactive Student Action Checklist**: Tracks task completion status.
- 💾 **Dual Storage Resilience**: Native Supabase PostgreSQL integration with an automatic zero-config local JSON store fallback for 100% demo uptime.
- 🧪 **Pre-configured Evaluation Suite**: 5 varied benchmark test cases directly accessible in the UI.

---

## 🏛️ Architecture & System Design

```mermaid
flowchart TD
    User["Student / Browser UI"] -->|Submits Notice Text| Server["Express Backend (Node.js)"]
    Server -->|Prompt with Schema & Defense| Gemini["Google Gemini API (1.5 Flash)"]
    Gemini -->|Structured Entity JSON| Server
    Server -->|Extracted Facts + Source Text| Verifier["Verification Engine"]
    Verifier -->|Verbatim Match Check| ExcerptMatch["Exact & Fuzzy Substring Match"]
    Verifier -->|Token & Entity Check| ConsistencyMatch["Date & Amount Cross-Check"]
    Verifier -->|Verification Statuses| TrustScore["Trust Score & Badge Computation"]
    TrustScore --> Server
    Server -->|Dual-Mode Persistence| Storage{"Supabase Configured?"}
    Storage -->|Yes| SupabaseDB[("Supabase PostgreSQL")]
    Storage -->|No / Offline| LocalStore[("Local JSON File Store")]
    Server -->|Verified Analysis Payload| User
```

---

## 🛠️ Technology Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern Dark Slate/Violet AI SaaS design), Modern ES6 JavaScript.
- **Backend**: Node.js (v20+), Express.js.
- **AI Engine**: Google Gemini API (`@google/generative-ai`), structured JSON schema output, low-temperature inference.
- **Verification Engine**: Custom deterministic substring locator, entity token matcher, and conflict detector.
- **Database**: Supabase PostgreSQL (or resilient local JSON store).

---

## 📋 Database Schema (Supabase PostgreSQL)

If using Supabase, execute this SQL in the **Supabase SQL Editor**:

```sql
-- 1. Create Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    original_text TEXT NOT NULL,
    analysis_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    evidence TEXT,
    due_date TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indexes for Fast Lookup
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_notice_id ON tasks(notice_id);
```

---

## 🚀 Quickstart & Local Installation (Beginner-Friendly)

### Step 1: Open Terminal in Project Directory
Ensure you are in the project folder:
```bash
cd "c:\Users\bhanu\Downloads\Prem Teja AI"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Open `.env` in any text editor and paste your Google Gemini API key:
```env
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key_here
ALLOWED_ORIGIN=*
```
> 💡 *Need a Gemini API key? Get one for free at [Google AI Studio](https://aistudio.google.com/).*

### Step 3: Run the Server
```bash
npm start
```
The server will boot and display:
```
🚀 NoticeSense AI Platform running on http://localhost:3000
🤖 Gemini API Key: Configured ✅
💾 Storage: Local JSON Store (fallback) ✅
```

### Step 4: Open in Your Web Browser
Visit: **`http://localhost:3000`**

---

## 🧪 Running the Benchmark Evaluation Suite
NoticeSense AI comes with an automated evaluation test script covering all 5 core stress cases:
```bash
npm test
```
**Test Results:**
```
====================================================
🧪 NoticeSense AI — Verification Engine Test Suite
====================================================
  ✅ PASS: Finds exact verbatim submission deadline excerpt
  ✅ PASS: Returns valid character offset in original notice
  ✅ PASS: Marks valid deadline as "Supported by notice"
  ✅ PASS: Flags hallucinated excerpt as "Not found in notice"
  ✅ PASS: Preserves empty deadlines array for notice without dates
  ✅ PASS: Accurately documents missing submission deadline
  ✅ PASS: Verifies submission cutoff date
  ✅ PASS: Detects event commencement date confused with submission cutoff
  ✅ PASS: Verifies exact ₹250 fee in exam circular
  ✅ PASS: Flags numerical mismatch between extracted fee and cited text
  ✅ PASS: Verifies 75% attendance eligibility rule
  ✅ PASS: Maintains explicit record of contradictory fee amounts
  ✅ PASS: Refuses to arbitrarily invent calendar date for relative expression
  ✅ PASS: Verification engine treats adversarial input solely as static text
====================================================
📊 Evaluation Results: 15 / 15 Tests Passed (100%)
====================================================
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/health` | System readiness & configuration status | None |
| `POST` | `/api/analyze` | Analyzes notice text and verifies facts | `{ title, text, save: true }` |
| `POST` | `/api/analyze-file` | Multimodal analysis of PDF & Image circulars | `{ title, fileBase64, mimeType, save: true }` |
| `POST` | `/api/ask` | Grounded Q&A against supplied notice | `{ noticeText, question }` |
| `POST` | `/api/compare` | Compares two notices for differences | `{ noticeA, noticeB, titleA, titleB }` |
| `GET` | `/api/notices` | Lists all saved notices | None |
| `GET` | `/api/notices/:id` | Returns single notice and tasks | None |
| `DELETE` | `/api/notices/:id` | Deletes notice and related tasks | None |
| `PATCH` | `/api/tasks/:id` | Updates task completion status | `{ completed: boolean }` |
| `GET` | `/api/tasks/upcoming` | Returns active pending tasks | None |

---

## 🌐 Deployment Instructions (Vercel / Render / Railway)

### Option A: Unified Node.js Deployment (Render / Railway / Heroku)
1. Push repository to GitHub.
2. In the hosting dashboard, set the build command to: `npm install`.
3. Set the start command to: `node server/server.js`.
4. Add the environment variable: `GEMINI_API_KEY=your_key`.

### Option B: Vercel Deployment
1. Set the root directory to project folder.
2. Ensure environment variables (`GEMINI_API_KEY`) are entered in the Vercel Project Settings.
3. Configure `ALLOWED_ORIGIN` to your deployed domain.

---

## 🔒 Security & Safe AI Principles
- **No Client Secrets**: API keys and database credentials are stored solely on the server in `.env`.
- **Untrusted Input Defense**: Notice text is treated strictly as untrusted data using delimiter boundary isolation to prevent prompt injection.
- **Safe HTML Rendering**: All dynamic AI strings are escaped before rendering in the DOM to prevent XSS attacks.
- **No Arbitrary Tool Execution**: The AI is restricted from triggering external commands or following web links inside notices.

---

## ⚠️ Known Limitations & Future Roadmap
- **OCR Quality**: Direct image / scanned document OCR accuracy depends on scan quality and document orientation.
- **Multilingual Support**: Currently optimized for English notices; support for regional Indian languages (Hindi, Telugu, Tamil, Marathi) can be added via Gemini multilingual prompting.
- **Calendar Sync**: Future integration with Google Calendar and Apple iCal via `.ics` export.

---

## 🏆 Hackathon Pitch Flow (2-Minute Demo)
1. **Show Dashboard**: Explain the problem college students face with complex notices.
2. **Load Sample Notice 1 (Scholarship)**: Click "Analyze Notice with Gemini" — show the summary and extracted deadline.
3. **Demonstrate Verification**: Click *"Inspect Source Evidence"* to show the exact verbatim sentence cited from Room 204.
4. **Stress Test with Grounded Q&A**:
   - Ask: *"What is the deadline?"* &rarr; Shows exact answer with cited proof.
   - Ask an unstated question: *"What is the portal URL?"* &rarr; NoticeSense responds: *"This information is not stated in the supplied notice."*
5. **Show Ambiguity Detection (Sample 5)**: Load contradictory notice &rarr; Show the yellow warning card flagging conflicting ₹1,500 vs ₹1,800 fees!
6. **Show Checklist**: Mark action items as complete in the personal student tracker.
