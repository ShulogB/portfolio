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
