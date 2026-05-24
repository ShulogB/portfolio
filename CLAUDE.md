# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture overview

This is a **bilingual personal portfolio** with two independent services:

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS) — lives at the repo root
- **Backend**: Django REST Framework — lives in `backend/`

The frontend fetches case study data from Django via ISR (`revalidate: 60s`). All other portfolio content (hero, experience summary, principles, tradeoffs, etc.) is stored as **typed static content** in `lib/content-en.ts` and `lib/content-es.ts`. The Django API takes precedence on project pages — if the API returns data, it overrides the static fallback in `lib/projects.ts`.

## Commands

### Frontend (run from repo root)

```bash
npm run dev          # development server at localhost:3000
npm run build        # production build
npm run build:clean  # wipe .next and rebuild (fixes "Cannot find module" errors, especially on OneDrive)
npm start            # serve production build (requires build first)
npm run lint         # ESLint via next lint
```

> If the repo is synced through OneDrive, pause sync before running `npm run build` — OneDrive can corrupt `.next/` mid-build.

### Backend (run from `backend/`)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env            # set SECRET_KEY, DATABASE_URL, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver      # API at localhost:8000

# Tests
python manage.py test           # all tests
python manage.py test core      # single app
```

## Environment variables

**Frontend (`.env` at repo root):**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Django base URL, no trailing slash (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (SEO, sitemap, OpenGraph) |
| `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_LINKEDIN_URL` | Social links in Hero and footer |
| `REVALIDATION_SECRET` | Shared secret for `POST /api/revalidate` |

**Backend (`backend/.env`):** `SECRET_KEY`, `DATABASE_URL`, `DEBUG`, `ALLOWED_HOSTS`, `FRONTEND_URL` (for the "View site" link in Django admin).

## Content architecture

### Bilingual system

Language is detected in this priority order (client): URL param `?lang=` → `localStorage` → cookie `portfolio-lang`. Server components read the cookie.

- `LanguageContext` (client) lazy-loads `content-es.ts` on demand and keeps it in a ref to avoid re-importing.
- `lib/content.ts` is the server-side entry point that exports `{ en, es }`.
- `LANG_COOKIE_NAME = "portfolio-lang"` is the constant used across server and client.

### Static vs. API content

Static content (edited in files):
- `lib/content-en.ts` / `lib/content-es.ts` — all UI labels and homepage section text
- `lib/projects.ts` — full structured data for each project page (scale constraints, ADRs, rejected approaches, deep dive)

Dynamic content (edited in Django admin):
- `core` app: ExperienceSummary, Principle, Technology, ExecutiveSnapshot, Decision, Tradeoff, DeepDiveEssay, OptimizeFor
- `case_studies` app: CaseStudy (+ images, EngineeringDecisions)

On project pages (`/projects/[slug]`), API fields override static fallback fields when non-empty. `getCaseStudy()` in `lib/caseStudyApi.ts` handles this fetch with ISR.

### ISR revalidation

Django triggers `POST /api/revalidate` (with `Authorization: Bearer <REVALIDATION_SECRET>`) after admin saves, which calls Next.js `revalidatePath("/")` and `revalidatePath("/projects/<slug>")`.

## Backend structure

```
backend/
├── portfolio_api/   # Django project settings and root URLs
├── core/            # ContactSubmission, PageView + portfolio content models (Principle, Tradeoff, etc.)
├── case_studies/    # CaseStudy, CaseStudyImage, EngineeringDecision
└── users/           # custom user model (if extended)
```

API endpoints (all under `/api/v1/`):
- `GET /case-studies/` — list (supports pagination)
- `GET /case-studies/<slug>/` — detail with gallery images and engineering decisions
- `POST /contact/` — public contact form
- `POST /track/` — page view tracking
- `GET /health/` — health check
- `POST /auth/token/` / `POST /auth/token/refresh/` — JWT

The Django admin (`/admin/`) is the primary CMS. The index page is augmented with metrics (contact count, page view count, top paths).

## Frontend structure

```
app/
├── page.tsx              # home — fetches case studies for carousel, renders HomeContent
├── projects/[slug]/      # project detail page — merges static + API data
├── api/revalidate/       # Next.js Route Handler for ISR revalidation
├── robots.ts / sitemap.ts
components/               # all UI components (server or client)
lib/
├── content-en.ts / content-es.ts  # all static text, typed against UILabels
├── content-types.ts               # shared TypeScript types
├── content.ts                     # re-exports { en, es }
├── projects.ts                    # static project data (fallback)
├── caseStudyApi.ts                # fetch wrapper for Django API (ISR-aware)
└── api.ts                         # API_BASE, ADMIN_LOGIN_URL, API_ENDPOINTS
context/
└── LanguageContext.tsx    # lang state, lazy ES content load, cookie sync
```

## Design system

Tailwind is extended with a custom "sega" palette (`sega-bg`, `sega-cyan`, `sega-yellow`, `sega-white`, etc.) and two fonts: Inter (`font-sans`) and Press Start 2P (`font-pixel`). See `tailwind.config.ts` for exact values.

## Deploy

- **Frontend**: Vercel/Netlify — `npm run build`, set all `NEXT_PUBLIC_*` env vars and `REVALIDATION_SECRET`.
- **Backend**: Railway (see `railway.toml`, `Procfile`) — set `DEBUG=False`, `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `FRONTEND_URL`. PostgreSQL required in production.
- After deploy: verify `/sitemap.xml` and `/robots.txt`; `NEXT_PUBLIC_SITE_URL` must be the real domain.
