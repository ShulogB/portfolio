# Backend (portfolio_api)

## Setup

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env         # Ajustar SECRET_KEY y DATABASE_URL
```

## Variables de entorno

- `SECRET_KEY` – clave secreta Django
- `DEBUG` – True/False
- `ALLOWED_HOSTS` – hosts permitidos (separados por coma)
- `DATABASE_URL` – URL PostgreSQL (ej: `postgres://user:pass@localhost:5432/dbname`)

## Base de datos (PostgreSQL)

Crear la base de datos y configurar `DATABASE_URL` en `.env`. Luego:

```bash
python manage.py migrate
python manage.py createsuperuser
```

## Tests

```bash
python manage.py test
```

Incluye tests del endpoint de contacto (`core.tests`).

## Ejecutar

```bash
python manage.py runserver
```

## Deploy rápido en Railway

1. Crear proyecto en Railway y conectar el repo GitHub.
2. Configurar **Root Directory** = `backend`.
3. Agregar un servicio **PostgreSQL** (Railway setea `DATABASE_URL`).
4. Variables requeridas:
   - `DEBUG=False`
   - `SECRET_KEY=<secreto-largo>`
   - `ALLOWED_HOSTS=<tu-backend>.up.railway.app,api.shulo.dev`
   - `FRONTEND_URL=https://shulo.dev`
   - `REVALIDATION_SECRET=<mismo valor que frontend>`
   - `CORS_ALLOWED_ORIGINS=https://shulo.dev,https://www.shulo.dev`
   - `CSRF_TRUSTED_ORIGINS=https://shulo.dev,https://www.shulo.dev`
5. En Deploy / Build & Start:
   - Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start: `gunicorn portfolio_api.wsgi:application --bind 0.0.0.0:$PORT`

## API

- **Case studies**: `GET/POST /api/v1/case-studies/`, `GET/PUT/PATCH/DELETE /api/v1/case-studies/<slug>/`  
  - Los case studies pueden llevar `image` (subida en admin). La API devuelve `image_url` con la URL absoluta.
- **Contacto** (público, throttled 10/hora): `POST /api/v1/contact/`  
  - Body: `{ "name", "email", "message", "source" }` (source opcional).
- **Visitas** (público, throttled 30/min): `POST /api/v1/track/`  
  - Body: `{ "path": "/" }` o `{ "path": "/projects/patagonia-dreams" }`.
- **JWT**: `POST /api/v1/auth/token/` (username, password), `POST /api/v1/auth/token/refresh/` (refresh)
- **Admin**: `/admin/`

Solo usuarios con rol **ADMIN** pueden crear/editar/eliminar case studies; lectura pública.

## Admin (autenticación y métricas)

- **Login**: `/admin/` con un usuario creado con `createsuperuser` (asignar rol ADMIN en Users si hace falta).
- **Case studies**: crear/editar, subir **imagen** por case study. La imagen se sirve en `MEDIA_URL` y la API devuelve `image_url`.
- **Contact submissions**: ver mensajes de contacto (nombre, email, mensaje, source, leído). Filtrar por fecha y por "read".
- **Page views**: ver visitas por ruta y fecha (filtrar por path o por fecha para métricas).
