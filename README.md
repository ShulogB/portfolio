# Portfolio — Senior Backend Engineer

Next.js (frontend) + Django REST (API, admin, case studies). Contenido bilingüe (EN/ES), formulario de contacto, métricas básicas y revalidación ISR.

## Requisitos

- **Node.js** 18+
- **Python** 3.11+ (backend)
- **PostgreSQL** (backend en producción; en desarrollo puede usarse la misma URL)

## Levantar en local

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env   # Ajustar SECRET_KEY, DATABASE_URL, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API por defecto: `http://127.0.0.1:8000` — ver [backend/README.md](backend/README.md) para endpoints.

### 2. Frontend

En la **raíz del repo** (no dentro de `backend/`):

```bash
cp .env.example .env
# Editar .env: NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

App: `http://localhost:3000`

### Producción local (`next start`)

Antes de `npm run start` hace falta un build íntegro. Si ves `Cannot find module './XXX.js'`:

1. Pará **todos** los `npm run dev` / `npm run start` (Ctrl+C).
2. Regenerá el build limpio:

```bash
npm run build:clean
```

3. `npm run start`

También podés usar solo `npm run clean` y luego `npm run build`. Si el repo está en **OneDrive**, conviene pausar la sincronización al compilar (a veces deja la carpeta `.next` incompleta).

### Variables de entorno (frontend, `.env` en la raíz)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del Django (sin barra final) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, Open Graph, `sitemap.xml` / `robots.txt`) |
| `NEXT_PUBLIC_GITHUB_URL` | Tu perfil de GitHub (Hero y footer) |
| `NEXT_PUBLIC_LINKEDIN_URL` | Tu perfil de LinkedIn |
| `REVALIDATION_SECRET` | Mismo valor que en el backend para `POST /api/revalidate` |

### Tests (backend)

```bash
cd backend
.\.venv\Scripts\python.exe manage.py test
```

Incluye tests del endpoint público de contacto (`core.tests`).

## Deploy (resumen)

1. **Frontend (Vercel, Netlify, etc.)**  
   - Build: `npm run build` / start: `npm start`  
   - Definir todas las `NEXT_PUBLIC_*` y `REVALIDATION_SECRET` en el panel del hosting.

2. **Backend (Railway, Render, VPS, etc.)**  
   - `DEBUG=False`, `ALLOWED_HOSTS`, `SECRET_KEY`, `DATABASE_URL`, CORS si el front está en otro dominio.  
   - Servir `MEDIA` y estáticos según tu proveedor.  
   - Opcional: `FRONTEND_URL` para el enlace “View site” en el admin Django.

3. **Tras el deploy**  
   - Comprobar `https://tudominio.com/sitemap.xml` y `https://tudominio.com/robots.txt`.  
   - `NEXT_PUBLIC_SITE_URL` debe ser el dominio real (no `example.com`).

## Sentry (opcional, producción)

No está incluido por defecto para mantener el bundle simple.

- **Next.js:** `npx @sentry/wizard@latest -i nextjs` y seguir el asistente (DSN en variables del hosting).  
- **Django:** `pip install sentry-sdk` y en `settings.py` (solo si `SENTRY_DSN` está definido):

```python
import sentry_sdk
if os.environ.get("SENTRY_DSN"):
    sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], traces_sample_rate=0.1)
```

## Estructura

```
portfolio/
├── app/                 # Next.js App Router (páginas, robots, sitemap, api/revalidate)
├── components/
├── lib/
├── public/              # resume.pdf, assets estáticos
├── backend/             # Django (API v1, admin, case studies)
└── README.md
```

## Métricas en los textos

Los números de negocio (reservas/mes, logins, uptime, etc.) viven en `lib/content-en.ts` / `content-es.ts` y en el admin para case studies. Actualizarlos cuando tengas datos reales no requiere cambiar código de routing: solo contenido y/o API.
