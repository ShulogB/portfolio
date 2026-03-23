"""
Django settings for portfolio_api project.
"""
import os
from pathlib import Path
from urllib.parse import quote, urlparse, urlunparse

# Forzar UTF-8 en el cliente PostgreSQL (evita UnicodeDecodeError en mensajes/libpq en Windows)
os.environ.setdefault("PGCLIENTENCODING", "UTF8")

import dj_database_url
from dotenv import load_dotenv


def _normalize_database_url(url: str) -> str:
    """Codifica usuario y contraseña en la URL para que sea 100% ASCII (evita UnicodeDecodeError en psycopg2/libpq en Windows)."""
    if not url or "postgres" not in url.lower():
        return url
    try:
        parsed = urlparse(url)
    except Exception:
        return url
    if parsed.username is None or parsed.password is None:
        return url
    safe_user = quote(parsed.username, safe="")
    safe_password = quote(parsed.password, safe="")
    host = f"{parsed.hostname or ''}"
    if parsed.port:
        host = f"{host}:{parsed.port}"
    netloc = f"{safe_user}:{safe_password}@{host}"
    return urlunparse(parsed._replace(netloc=netloc))

BASE_DIR = Path(__file__).resolve().parent.parent
_env_path = BASE_DIR / ".env"
if _env_path.exists():
    load_dotenv(_env_path, encoding="utf-8", override=True)

# Leer DATABASE_URL directamente del archivo .env para evitar valores con encoding raro en os.environ (Windows)
_raw_db_url = ""
if _env_path.exists():
    try:
        with open(_env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL=") and not line.startswith("DATABASE_URL=#"):
                    _raw_db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    except Exception:
        pass
if not _raw_db_url:
    _raw_db_url = os.environ.get("DATABASE_URL", "") or ""

if _raw_db_url and "postgres" in _raw_db_url.lower():
    from portfolio_api import db_dsn
    db_dsn.DSN = _normalize_database_url(_raw_db_url)
    os.environ["DATABASE_URL"] = db_dsn.DSN

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

DEBUG = os.environ.get("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "core",
    "users",
    "case_studies",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "portfolio_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "portfolio_api.wsgi.application"

# Base de datos: USE_SQLITE=1 en .env usa SQLite (evita el bug de encoding de psycopg2 en Windows)
_use_sqlite = ""
if _env_path.exists():
    try:
        with open(_env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("USE_SQLITE=") and not line.startswith("USE_SQLITE=#"):
                    _use_sqlite = line.split("=", 1)[1].strip().lower()
                    break
    except Exception:
        pass
if not _use_sqlite:
    _use_sqlite = os.environ.get("USE_SQLITE", "").lower()

if _use_sqlite in ("1", "true", "yes"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "CONN_MAX_AGE": 600}}
    if _raw_db_url and "postgres" in _raw_db_url.lower():
        try:
            _parsed = urlparse(_raw_db_url)
            _db_name = (_parsed.path or "/portfolio").lstrip("/") or "portfolio"
            DATABASES["default"].update({
                "NAME": _db_name,
                "USER": _parsed.username or "portfolio_user",
                "PASSWORD": _parsed.password or "",
                "HOST": _parsed.hostname or "localhost",
                "PORT": _parsed.port or "5432",
            })
        except Exception:
            DATABASES = {"default": dj_database_url.config(conn_max_age=600, default=_raw_db_url)}
    else:
        DATABASES = {"default": dj_database_url.config(conn_max_age=600, default=os.environ.get("DATABASE_URL", ""))}

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
LANGUAGES = [("en", "English"), ("es", "Spanish")]
LOCALE_PATHS = [BASE_DIR / "locale"]
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS: localhost:3000 (Next.js)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# URL del frontend (portfolio). El enlace "View site" del admin abre esta URL.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# Revalidación bajo demanda (Next.js): si está definido, al guardar un Case study se llama a
# POST {FRONTEND_URL}/api/revalidate con este token para invalidar caché.
REVALIDATION_SECRET = os.environ.get("REVALIDATION_SECRET", "")

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
    },
}
