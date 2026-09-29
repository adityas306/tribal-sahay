# TribalSahay — Unified Scholarship Platform

Full-stack SIH prototype for the Ministry of Tribal Affairs problem statement **“Unified Scholarship Mobile Application for Tribal Students”**.

## Features
- Create Account / Login / Logout with JWT sessions
- Student profile and eligibility-oriented profile fields
- Unified directory of the five MoTA scholarship schemes
- Direct links to official application portals
- Application tracking workflow (Submitted → Verification → Sanction → Disbursement)
- Digital document wallet with upload API
- JAGO scholarship assistant connected to the user's application data
- FastAPI REST backend + SQLite database
- Responsive React/Vite frontend
- Render + Vercel deployment ready

## Important integration note
This prototype does **not** impersonate or submit to government systems. It uses official portal links for final application. Real DigiLocker, UIDAI, UDISE+, APAAR, NSP/SFMP and other integrations require authorized APIs/credentials and applicable security/privacy approvals.

## Official references
- MoTA scholarship information: https://tribal.nic.in/ScholarshiP.aspx
- MoTA DBT schemes: https://dbttribal.gov.in/AllScheme.aspx
- NSP Top Class: https://scholarships.gov.in/All-Scholarships
- NFST: https://fellowship.tribal.gov.in/
- NOS: https://overseas.tribal.gov.in/

## Local setup
### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Open http://localhost:8000/docs.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```
Restart Vite after changing `.env`.

## Render backend
Create a **Web Service** from the `backend` folder.
- Runtime: Python
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment: `JWT_SECRET=<long-random-secret>`

SQLite is suitable for an MVP/demo. For production, move the database and uploaded documents to managed PostgreSQL/object storage.

## Vercel frontend
Import the repository and set the frontend root directory to `frontend`.
Environment variable:
```env
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
```
Do **not** append `/api` to `VITE_API_URL` because the frontend calls `/api/...` itself. Redeploy after setting the variable.

## End-to-end flow
Create Account → Login → Complete Profile → Explore Schemes → Open official application portal → Track prototype application → Upload documents → Ask JAGO → Logout.
