# TribalSahay — Unified Scholarship Platform

A full-stack SIH prototype for the Ministry of Tribal Affairs problem statement:

> **“Unified Scholarship Mobile Application for Tribal Students”**

TribalSahay is designed as a unified digital platform where tribal students can explore scholarship schemes, maintain their profile and documents, track application progress, and get scholarship-related assistance through **JAGO AI**.

---

## 🚀 Features

### 👤 Authentication & Student Profile

* Create student account
* Login / Logout
* JWT-based authentication
* Secure protected routes
* Student profile management
* Education and eligibility-oriented profile fields

### 🎓 Scholarship Discovery

* Unified scholarship directory
* Information about major MoTA scholarship schemes
* Scholarship eligibility-oriented information
* Direct links to official government application portals
* Centralized access to scholarship resources

### 📋 Application Tracking

Prototype application workflow:

```text
Submitted
    ↓
Verification
    ↓
Sanction
    ↓
Disbursement
```

Students can track the status of their prototype scholarship applications from one dashboard.

### 📄 Digital Document Wallet

* Upload student documents
* Store document metadata
* Track document status
* Access documents from the student dashboard
* Backend upload API

> Production deployment should use secure object storage instead of local/SQLite file storage.

### 🤖 JAGO AI

**JAGO AI** is the scholarship assistance layer of TribalSahay.

It can help students with:

* Scholarship information
* Eligibility questions
* Application-related queries
* Required documents
* Payment-related questions
* Application status
* Scholarship-related problems
* Practical guidance

JAGO can also use relevant user/application context available inside TribalSahay to provide more contextual assistance.

### 💬 Chat & Conversation History

* Real-time AI response streaming
* Markdown-formatted responses
* Persistent conversation history
* Create new conversations
* Rename conversations
* Delete conversations
* Previous messages available when reopening a conversation

### 📱 Responsive Frontend

* React + Vite
* Responsive dashboard
* Mobile-friendly interface
* Scholarship browsing
* Student profile
* Application tracking
* Document wallet
* JAGO AI chat

---

# 🏗️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* React Router
* Fetch / Axios

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* SQLite

## AI

* JAGO AI
* LLM-powered scholarship assistant
* Streaming responses
* Context-aware responses

## Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** SQLite for MVP/demo

---

# 📁 Project Structure

```text
TribalSahay/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── tribalsahay.db
│
├── frontend/
│   ├── src/
│   │   |── api/
│   │   ├── components/
│   │   |── data/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

# 🔄 End-to-End Flow

```text
Create Account
      ↓
Login
      ↓
Complete Student Profile
      ↓
Explore Scholarships
      ↓
Check Scholarship Information
      ↓
Open Official Application Portal
      ↓
Track Prototype Application
      ↓
Upload Documents
      ↓
Ask JAGO AI
      ↓
Logout
```

---

# 🧠 JAGO AI Flow

```text
Student Question
       ↓
TribalSahay Frontend
       ↓
FastAPI Chat API
       ↓
User / Application Context
       ↓
JAGO AI
       ↓
Streaming Response
       ↓
Markdown Rendering
       ↓
Student
```

JAGO can use relevant information such as:

* Student profile
* Education details
* Application records
* Document records
* Previous conversation messages

Only the context required for the user's query should be used.

---

# 🔐 Authentication

TribalSahay uses JWT-based authentication.

Typical flow:

```text
Login
  ↓
Backend validates credentials
  ↓
JWT generated
  ↓
Frontend stores authentication token
  ↓
Token sent with protected API requests
  ↓
FastAPI validates JWT
```

Protected resources include student-specific data such as:

* Profile
* Applications
* Documents
* Conversations
* JAGO context

---

# ⚙️ Local Setup

## 1. Clone Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY>
cd TribalSahay
```

---

# 🐍 Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

Backend will be available at:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Vite will provide a local URL similar to:

```text
http://localhost:5173
```

---

# 🔑 Frontend Environment Variable

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing environment variables.

> Do **not** append `/api` to `VITE_API_URL` if the frontend already adds `/api/...` to its requests.

---

# 🌐 Render Backend Deployment

Create a **Web Service** on Render using the `backend` directory as the root.

### Runtime

```text
Python
```

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Required Environment Variables

```env
JWT_SECRET=<long-random-secret>
```

Add any AI provider/API credentials required by your JAGO AI service, for example:

```env
GROQ_API_KEY=<your-api-key>
```

Keep API keys in environment variables.

**Never commit secrets to GitHub.**

---

# ▲ Vercel Frontend Deployment

Import the repository into Vercel.

Set the frontend root directory to:

```text
frontend
```

Add:

```env
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
```

For example:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Do **not** use:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

if your frontend already constructs requests such as:

```text
/api/auth/...
/api/chat/...
/api/applications/...
```

After setting the environment variable:

```text
Redeploy → Vercel
```

---

# 🗄️ Database

The prototype currently uses:

```text
SQLite
```

SQLite is suitable for local development and an MVP/demo.

For production-scale deployment, consider:

```text
PostgreSQL
```

along with managed database infrastructure.

---

# 📦 Document Storage

The prototype provides a document upload API.

For production deployment, uploaded files should preferably be stored in secure object storage such as:

```text
Object Storage
      ↓
Secure File URL
      ↓
Database Metadata
```

The database should store metadata rather than relying on local application storage.

---

# 🔗 Official Scholarship References

TribalSahay provides links to official government resources rather than impersonating government portals.

### Ministry of Tribal Affairs

[MoTA Scholarship Information](https://tribal.nic.in/ScholarshiP.aspx?utm_source=chatgpt.com)

### MoTA DBT Schemes

[MoTA DBT Schemes](https://dbttribal.gov.in/AllScheme.aspx?utm_source=chatgpt.com)

### National Scholarship Portal

[NSP — All Scholarships](https://scholarships.gov.in/All-Scholarships?utm_source=chatgpt.com)

### National Fellowship for ST Students

[NFST Official Portal](https://fellowship.tribal.gov.in/?utm_source=chatgpt.com)

### National Overseas Scholarship

[National Overseas Scholarship](https://overseas.tribal.gov.in/?utm_source=chatgpt.com)

---

# ⚠️ Important Integration & Security Note

TribalSahay is a **prototype**.

It does **not** impersonate, replace, or directly submit applications to government systems.

The platform uses official government portal links for the final application process.

Real integrations with services such as:

* DigiLocker
* UIDAI
* UDISE+
* APAAR
* NSP
* SFMP
* Government DBT systems

would require:

* Authorized APIs
* Official credentials
* Appropriate authentication mechanisms
* Data protection controls
* Applicable security approvals
* Applicable privacy and regulatory compliance

No government credentials or private student information should be hard-coded into the application.

---

# 🔒 Security Considerations

For production deployment:

* Use HTTPS everywhere
* Store secrets only in environment variables
* Use a strong JWT secret
* Implement token expiration and refresh strategy where appropriate
* Validate uploaded file types and sizes
* Scan uploaded files for malware
* Restrict access to student-owned documents
* Avoid exposing sensitive student information in logs
* Use secure database credentials
* Use managed PostgreSQL for production
* Use secure object storage for documents
* Apply rate limiting to authentication and AI endpoints
* Implement appropriate audit logging
* Follow applicable privacy and security requirements

---

# 🧪 Prototype Scope

The current project demonstrates the complete student-facing workflow:

```text
Authentication
      ↓
Student Profile
      ↓
Scholarship Discovery
      ↓
Application Tracking
      ↓
Document Wallet
      ↓
JAGO AI
      ↓
Conversation History
```

Government-system integration is intentionally kept outside the prototype boundary.

---

# 🎯 SIH Prototype Objective

The objective of TribalSahay is to demonstrate how multiple scholarship-related activities can be brought together into a single student-oriented platform.

Instead of requiring students to navigate multiple disconnected resources, the prototype provides a unified interface for:

* Discovering scholarship opportunities
* Understanding eligibility
* Accessing official application portals
* Tracking application progress
* Managing documents
* Getting AI-assisted guidance

---

# 🚀 Future Scope

Potential future improvements include:

* DigiLocker integration through authorized APIs
* Government scholarship API integration
* Real-time application status synchronization
* Advanced eligibility engine
* Multilingual JAGO AI
* Voice-based scholarship assistance
* OCR-based document verification
* Automatic document classification
* Scholarship recommendation engine
* Notification and reminder system
* Push notifications
* Production PostgreSQL database
* Secure cloud object storage
* Advanced analytics dashboard
* Admin verification workflow
* Accessibility improvements

---

# 👨‍💻 Development

Run backend and frontend separately during development.

### Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

---

# 📜 License

This project is developed as an prototype for educational and demonstration purposes.

Before using government branding, data, APIs, or production integrations, obtain the required authorization and comply with applicable terms and regulations.
