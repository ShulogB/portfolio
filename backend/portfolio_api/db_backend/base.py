"""
Backend PostgreSQL que usa la URL de conexión como DSN único (solo ASCII).
Evita UnicodeDecodeError en Windows cuando la contraseña tiene tildes.
"""
from django.db.backends.postgresql import base as pg_base

try:
    from portfolio_api import db_dsn
except ImportError:
    db_dsn = None


class DatabaseWrapper(pg_base.DatabaseWrapper):
    def get_connection_params(self):
        dsn = getattr(db_dsn, "DSN", "") if db_dsn else ""
        if dsn and "postgres" in dsn.lower():
            return {"dsn": dsn}
        return super().get_connection_params()
