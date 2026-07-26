# 🌙 JobLune

A job board built for round-the-clock careers — post roles, browse openings, and apply, day or night.

**Live demo:** _add your deployed URLs here after deployment_
- Frontend: `https://joblune.vercel.app`
- Backend API: `https://joblune-api.onrender.com`
- API docs (Swagger): `https://joblune-api.onrender.com/swagger-ui.html`

**Demo credentials** (seed these after first deploy, see [Seeding demo data](#seeding-demo-data)):
- Job seeker: `seeker@demo.com` / `password123`
- Employer: `employer@demo.com` / `password123`

---

## 1. Problem statement

Globalco runs multi-shift, multi-country operations, and roles like theirs (night-shift, onsite, generalist) don't fit neatly into mainstream job boards built around 9-to-5, remote-first listings. JobLune is a focused job board MVP: employers post roles and manage applicants; job seekers search, filter, and apply with a resume upload — nothing more, nothing less, done properly.

## 2. Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐        ┌──────────────┐
│  React SPA       │ ───────────────────────▶ │  Spring Boot API      │ ─────▶ │  PostgreSQL   │
│  (Vite, Tailwind) │ ◀─────────────────────── │  (JWT auth, REST)     │        │               │
│  hosted on Vercel │                          │  hosted on Render     │        └──────────────┘
└─────────────────┘                          └──────────┬────────────┘
                                                          │
                                                          ▼
                                                ┌───────────────────┐
                                                │  Cloudinary         │
                                                │  (resume storage)   │
                                                └───────────────────┘
```

**Why not deploy the Spring Boot backend to Vercel?** Vercel's runtime is built for static sites and serverless/edge functions (Node, Python, Go, etc.) — it does not run a persistent JVM process, so a Spring Boot app can't be deployed there directly. The backend is deployed to **Render** (free tier, supports long-running containers) via its own CI/CD job; the React frontend deploys to **Vercel** via its own CI/CD job. This is the standard, correct split for this stack, not a workaround.

### Data model

```
User (JOB_SEEKER | EMPLOYER | ADMIN)
  └─ Company (only for EMPLOYER)
       └─ Job
            └─ Application ── belongs to a User (applicant) + a Job
```

- One `Application` per (applicant, job) pair — enforced by a DB unique constraint.
- Job status flow: `APPLIED → REVIEWED → SHORTLISTED → REJECTED/HIRED`.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Backend | Java 17, Spring Boot 3 (Web, Security, Data JPA, Validation) |
| Auth | JWT access + refresh tokens, BCrypt password hashing |
| Database | PostgreSQL (H2 in-memory for tests) |
| File storage | Cloudinary (resumes) |
| API docs | springdoc-openapi (Swagger UI) |
| Frontend | React 18 (Vite), React Router, Tailwind CSS, Axios |
| Testing | JUnit 5, Mockito, Spring MockMvc |
| CI/CD | GitHub Actions |
| Hosting | Render (backend), Vercel (frontend) |

## 4. Running locally

### Prerequisites
Java 17, Maven, Node 20+, Docker (optional but recommended for Postgres).

### Backend
```bash
cd backend
cp .env.example .env   # fill in Cloudinary keys if you want resume upload to work
# Start Postgres (or use the root docker-compose instead)
docker run -d --name joblune-pg -e POSTGRES_DB=joblune -e POSTGRES_USER=joblune \
  -e POSTGRES_PASSWORD=joblune -p 5432:5432 postgres:16-alpine

mvn spring-boot:run
```
API runs at `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs at `http://localhost:5173`.

### Or, everything via Docker Compose
```bash
docker compose up --build
```
Runs Postgres + backend together. Run the frontend separately with `npm run dev` for hot reload during development.

### Running tests
```bash
cd backend
mvn clean test
```

## 5. Deployment

### Backend → Render
1. Create a new **Web Service** on Render, point it at this repo's `backend/` directory (or use the included `backend/Dockerfile`).
2. Set environment variables from `backend/.env.example` (`DB_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, Cloudinary keys, etc.) — Render can also provision a managed Postgres instance and inject `DB_URL` for you.
3. Copy the service's **Deploy Hook URL** and add it as a GitHub Actions secret named `RENDER_DEPLOY_HOOK_URL`.

### Frontend → Vercel
1. Run `vercel link` once locally inside `frontend/` to create the project on Vercel.
2. Add these as GitHub Actions secrets: `VERCEL_TOKEN`, and set `VITE_API_BASE_URL` to your deployed backend URL.
3. Alternatively, skip GitHub Actions entirely for the frontend and use Vercel's native Git integration (connect the repo, set root directory to `frontend/`) — either path is a valid CI/CD deploy; this repo ships the GitHub Actions version to satisfy an explicit CI/CD pipeline requirement end-to-end.

### CI/CD pipeline summary
- `.github/workflows/backend-ci.yml`: on every push/PR touching `backend/**`, spins up a real Postgres service container, runs the full Maven test suite, builds the jar, and (on `main`) triggers a Render deploy hook.
- `.github/workflows/frontend-ci.yml`: on every push/PR touching `frontend/**`, installs, lints, and builds the app, and (on `main`) deploys to Vercel via the Vercel CLI.
- Both are gated: deploy only runs after tests/build succeed, and only on `main`.

## 6. Seeding demo data

There's no seed script bundled (kept the footprint small for review), but you can create demo accounts instantly through the running app:
1. Register a job seeker via `/register`.
2. Register an employer via `/register` (this also creates their `Company`).
3. Log in as the employer, post a job.
4. Log in as the job seeker, apply to it (with a resume file).
5. Log back in as the employer to see the application and change its status.

## 7. API overview

Full interactive docs live at `/swagger-ui.html` once the backend is running. Summary:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account (job seeker or employer) |
| POST | `/api/auth/login` | Public | Get access + refresh tokens |
| POST | `/api/auth/refresh` | Public | Exchange refresh token for a new pair |
| GET | `/api/jobs` | Public | Search/filter active jobs (keyword, location, type, tag) |
| GET | `/api/jobs/{id}` | Public | Job details |
| GET | `/api/jobs/mine` | Employer | List your own postings (incl. inactive) |
| POST | `/api/jobs` | Employer | Create a job |
| PUT | `/api/jobs/{id}` | Employer (owner) / Admin | Update a job |
| DELETE | `/api/jobs/{id}` | Employer (owner) / Admin | Delete a job |
| POST | `/api/applications` | Job seeker | Apply to a job |
| GET | `/api/applications/me` | Job seeker | View your applications |
| GET | `/api/applications/job/{jobId}` | Employer (owner) / Admin | View applicants for a job |
| PATCH | `/api/applications/{id}/status` | Employer (owner) / Admin | Update application status |
| POST | `/api/uploads/resume` | Job seeker | Upload resume, returns a URL |

## 8. Known limitations / next steps

Honest about MVP tradeoffs rather than hiding them:
- No email notifications on status change (would use the already-included `spring-boot-starter-mail`).
- No pagination controls in the frontend UI yet, though the backend already supports `Pageable`.
- No admin UI (backend supports the `ADMIN` role and its permissions, but there's no dedicated screen).
- Tags are a simple comma-separated string rather than a normalized many-to-many table — fine at this scale, would revisit for a larger catalog.

## 9. How AI was used in this build

In the spirit of the assignment's instructions, here's a transparent account:
- **Scaffolding & boilerplate**: entity/DTO/controller structure, Spring Security config, JWT filter, and the React component/page shells were AI-drafted, then reviewed for correctness (e.g. fixing the auth filter to fail closed on invalid tokens instead of throwing a raw 500, adding the unique constraint on `(applicant_id, job_id)`, adding the `/api/jobs/mine` endpoint once the employer dashboard needed it).
- **Design system**: the "night-shift/moonlight" visual direction was chosen deliberately to tie into both the product name and Globalco's actual night-shift business, not a default AI theme.
- **CI/CD pipeline**: AI-drafted, matched to this repo's real folder structure and the constraint that Vercel can't host the Spring Boot backend directly.
- **What I'd double check before treating this as production-ready**: running the full test suite in a real environment (Maven Central wasn't reachable in the sandbox used to draft this), load-testing the search endpoint, and a security review of the JWT secret handling in whatever secret manager the deployment target uses.

---

Built for the Globalco Software Engineer (Generalist) assessment.
