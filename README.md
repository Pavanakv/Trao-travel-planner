# Voyage — AI Travel Planner

A full-stack trip planning app where users register, describe a trip (destination, days, budget, interests), and get back an AI-generated day-by-day itinerary, budget estimate, hotel suggestions, and a destination-aware packing checklist — all editable afterward.

Built for the Trao Technologies Full-Stack Engineering Assessment.

---

## 1. Project Overview

Users sign up, fill in a short trip form, and the backend calls an LLM to generate:
- A day-by-day itinerary
- A 4-line budget estimate (flights, accommodation, food, activities)
- Three hotel suggestions across budget tiers, with a representative photo
- A tailored packing checklist (custom feature, see §7)

From the trip page, users can add/remove individual activities, regenerate a single day with a free-text instruction (e.g. "more outdoor activities"), or regenerate the whole plan. All trip data is scoped to the logged-in user — no cross-user access is possible at the database query level.

---

## 2. Tech Stack & Justification

| Layer | Choice |
|---|---|
| Frontend | Vite + React + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt password hashing |
| AI | Google Gemini API (model configurable via env var) |
| Photos | Pexels API (optional — falls back to a gradient+monogram card if unset) |
| Deployment | Vercel (frontend) + Render (backend) |

The brief's preferred stack was Next.js + Tailwind for the frontend. I used Vite + React instead: this app is a fully authenticated, client-side dashboard with no SEO or server-rendering requirement, so CSR with Vite gives a lighter, faster-to-iterate setup without giving up anything the brief actually needs. Backend, database, and language (JavaScript) match the preferred stack exactly.

---

## 3. Setup Instructions

### Local

**Backend**
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY (PEXELS_API_KEY optional)
npm install
npm run dev             # http://localhost:5000
```

**Frontend**
```bash
cd frontend
cp .env.example .env    # set VITE_API_URL if backend isn't on localhost:5000
npm install
npm run dev              # http://localhost:5173
```

### Deployed

- **Backend (Render):** root directory `backend`, build `npm install`, start `npm start`, env vars from `backend/.env.example` (set `CLIENT_ORIGIN` to the Vercel URL once it exists, and `NODE_ENV=production`)
- **Frontend (Vercel):** root directory `frontend`, env var `VITE_API_URL` = the Render backend URL + `/api`

**Live app:** _add your deployed URL here_
**GitHub repo:** _add your repo URL here_
**Video walkthrough:** _add your video link here_

---

## 4. Architecture
