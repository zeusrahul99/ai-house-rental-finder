# AI-Powered House Rental Finder

A scaffolded full-stack prototype with:
- Next.js frontend
- FastAPI backend
- SQLite data storage
- OpenAI chatbot placeholder support
- Sample house search and recommendation UI

## Setup

1. Open the project folder in VS Code.
2. Install frontend dependencies:
   ```powershell
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```powershell
   cd ..\backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
4. Start backend:
   ```powershell
   uvicorn main:app --reload
   ```
5. Start frontend:
   ```powershell
   cd ..\frontend
   npm run dev
   ```

## Notes

- Add `OPENAI_API_KEY` to the backend environment to enable chatbot calls.
- Optionally add `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` before starting the frontend to proxy requests through the backend.
- If the frontend is run without a backend, the built-in API routes return sample houses and a fallback chatbot answer.
- The backend now stores sample house listings in `houses.db` using SQLite and SQLAlchemy.
