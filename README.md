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
frontend (React)              backend (Express)              MongoDB

─────────────────             ──────────────────              ───────

Login / Register   ─────►     /api/auth/*        ─────►       User

Dashboard          ─────►     /api/trips         ─────►       Trip

Trip Detail        ─────►     /api/trips/:id/*                 │

itinerary                                                  ├─ days[]
budget                    services/llmService.js           ├─ budgetEstimate
hotels             ─────► (Gemini API calls,                ├─ hotelSuggestions[]
packing list               isolated from routes)            └─ packingList[]

─────► services/photoService.js

(Pexels calls, also isolated)


Key design choice: all LLM calls live in one `services/llmService.js` module, and all photo lookups live in one `services/photoService.js` module. Routes and controllers never call Gemini or Pexels directly — they call `llm.generateTripPlan(...)`, `llm.regenerateDay(...)`, `getDestinationPhoto(...)`, or `getHotelPhotos(...)`. Either provider can be swapped by editing one file.

Two other isolation choices worth calling out:
- `backend/utils/errors.js` centralizes error responses (`sendError`) so no controller accidentally leaks internal error detail to a client in production.
- `frontend/src/components/` holds the pieces the trip detail and dashboard pages compose — `DayCard`, `BudgetCard`, `PackingList`, `HotelsSection`, `TripCard`, `TopNav`, `DeleteConfirmModal` — each owns its own local UI state where it makes sense (e.g. `DayCard` manages its own "add activity" input), so the parent pages stay focused on data-fetching and orchestration rather than micromanaging every input's state.

Backend middleware order in `server.js`: `helmet` → `cors` → `express.json` (size-limited) → rate limiters (general, auth-specific, AI-specific) → routes → 404 handler → error handler.

### Data model
User: name, email, passwordHash
Trip: userId (indexed, ref User), destination, numDays, budgetType, interests[],

photoUrl,

days: [{ dayNumber, activities[] }],

budgetEstimate: { flights, accommodation, food, activities, total },

hotelSuggestions: [{ name, tier, note, photoUrl }],

packingList: [{ item, checked }]

### API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/auth/me` | Current user (protected) |
| POST | `/api/trips` | Create trip + generate full AI plan + fetch photos |
| GET | `/api/trips` | List the current user's trips |
| GET | `/api/trips/:id` | Get one trip |
| DELETE | `/api/trips/:id` | Delete a trip |
| POST | `/api/trips/:id/regenerate-plan` | Re-run full AI generation (retry / refresh) |
| POST | `/api/trips/:id/days/:dayNumber/regenerate` | Regenerate one day from an instruction |
| PATCH | `/api/trips/:id/days/:dayNumber/activities` | Add/remove a single activity (no AI call) |
| PATCH | `/api/trips/:id/packing/:index` | Toggle a packing item checked |
| POST | `/api/trips/:id/packing` | Manually add a packing list item |

All `/api/trips/*` routes run through `authMiddleware` and then re-scope every query to `{ _id, userId: req.userId }` — a user simply cannot fetch, edit, or delete a trip that isn't theirs, because the query itself excludes it (not just a UI-level check).

---

## 5. Authentication & Authorization Approach

- Passwords hashed with bcrypt before storage, never stored or logged in plain text.
- On login/register, a JWT (signed with `JWT_SECRET`, default 7-day expiry) is returned and stored in `localStorage` on the client.
- `authMiddleware` verifies the JWT on every protected route and attaches `req.userId`.
- **Authorization, not just authentication:** every trip query includes `userId: req.userId` as a filter — there is no code path where one user's trip ID can return another user's data, because the database query itself is scoped.
- Server-side validation on register/login (email format, password length, type checks) so the API can't be fed garbage data even if someone bypasses the frontend entirely and calls it directly.
- `/api/auth/*` is rate-limited (20 requests / 15 min per IP) to slow down credential-stuffing or brute-force attempts.
- `helmet` sets standard security headers; request bodies are capped at 100kb to limit payload-based abuse.

Trade-off: JWT in `localStorage` is simpler to implement under a tight deadline than httpOnly cookies + refresh-token rotation, but it is more exposed to XSS than a cookie-based approach. Documented under Known Limitations.

---

## 6. AI Agent Design & Purpose

The LLM (via the Gemini API) is used for the genuinely generative parts of the app — content a rules engine couldn't produce — while everything else (auth, CRUD, activity add/remove) is plain deterministic code. Specifically:

1. **`generateTripPlan`** — one call that returns itinerary + budget + hotels + packing list together (not four separate calls), to minimize latency and cost per trip creation.
2. **`regenerateDay`** — a scoped call that only touches one day's activities, so a user can say "more outdoor activities" without losing the rest of their plan.

Both functions force strict JSON output via prompt instructions, then parse with a retry-once fallback if the model wraps the response in markdown or returns malformed JSON — this was the most common real failure mode hit during testing.

Photos (Pexels) are a separate, deliberately non-AI concern: the destination cover photo is searched by destination name directly, since that's a real, verifiable place. Hotel photos are searched by **destination + tier** (e.g. "Tokyo luxury hotel room"), not by the AI-suggested hotel name — because an LLM-generated hotel name isn't a verified real business, and pairing a real photo with a specific unverified name would misrepresent it. The photo is illustrative ambiance, not a claim about a specific property.

---

## 7. Creative Feature: AI-Generated Packing Checklist

Every itinerary stops at "what to do" — none of them tell you what to actually bring. I added a packing checklist generated in the same call as the itinerary, tailored to the destination's likely climate/season, trip length, and the user's stated interests (e.g. "Adventure" pulls in different gear than "Shopping"). It renders as a checkbox list on the trip page, and users can also add their own items manually.

**Why this, and not something else:** it reuses the existing LLM service pattern (no new infrastructure), it's genuinely useful (packing needs vary a lot by destination), and it's easy to demo clearly in a short video.

---

## 8. Key Design Decisions & Trade-offs

- **One combined generation call** instead of separate calls for itinerary/budget/hotels/packing — faster and cheaper, at the cost of a slightly more complex prompt and JSON schema.
- **Day-level regeneration** instead of full-plan-only — lets users iterate ("Day 3 needs more outdoor stuff") without losing everything else, closer to how a person actually plans a trip.
- **No SSR (Vite over Next.js)** — see §2.
- **JWT in localStorage over httpOnly cookies** — faster to build correctly under the deadline; documented as a limitation rather than silently ignored.
- **Server-side validation duplicates some frontend validation** (e.g. password length, numDays bounds, budget enum) — frontend constraints (HTML `min`/`max`/`required`) are trivially bypassable via direct API calls, so every constraint that matters is re-checked in the controller before touching the database.
- **Generic error messages to clients in production** — controllers log full error detail server-side via a shared `sendError` helper, but only return a safe message to the client when `NODE_ENV=production`, so internal errors (DB connection strings, stack traces) never leak in a response body.
- **Rate limiting on auth and AI-generation endpoints** — login/register are limited to reduce brute-force risk; trip creation and regeneration are limited separately since each call costs real money against the Gemini API and has no natural cap otherwise.
- **Component decomposition** — `TripDetail.jsx` and `Dashboard.jsx` compose small, focused components (`DayCard`, `BudgetCard`, `PackingList`, `HotelsSection`, `TripCard`) rather than rendering everything inline.
- **No fabricated UI states** — trip cards show "Planned" or "Pending" based on real data (whether `days.length > 0`), not a fake "Generating..." status, since generation is synchronous and there's no real in-progress state to represent honestly. Similarly, nav elements that don't correspond to a real page weren't shipped as dead links.
- **Photos are illustrative, not authoritative** — see §6's explanation of why hotel photos are searched by destination+tier rather than hotel name.

---

## 9. Known Limitations

- JWT stored in `localStorage` rather than an httpOnly cookie (XSS exposure trade-off, see §5).
- No refresh-token rotation — a session is valid for the JWT's full expiry window with no revocation mechanism.
- LLM output quality varies with the underlying model; free-tier Gemini models can be slower or less consistent than a paid model. The retry-once JSON parser mitigates malformed responses but doesn't guarantee itinerary quality.
- No automated test suite — given the deadline, testing was manual (build checks + end-to-end manual flows) rather than unit/integration tests.
- Activity and packing-item removal/toggling is index-based; concurrent edits from two open tabs on the same trip could conflict (last write wins, no optimistic locking).
- Rate limits are in-memory (`express-rate-limit` defaults), so they reset on server restart and don't share state across multiple server instances — fine for a single Render instance, not for a horizontally-scaled deployment.
- Photo fetching (Pexels) is entirely optional and best-effort: if `PEXELS_API_KEY` is unset, or the free-tier rate limit is hit, or a query returns no results, the app falls back to a gradient+monogram card with no error shown to the user — this is intentional, but means photo coverage isn't guaranteed for every destination/hotel tier.
