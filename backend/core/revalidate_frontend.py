"""Invalidación de caché del frontend Next.js (ISR) vía POST /api/revalidate."""

import json
import urllib.error
import urllib.request

from django.conf import settings


def trigger_frontend_revalidate(case_study_slug: str | None = None) -> None:
    """
    Si REVALIDATION_SECRET y FRONTEND_URL están definidos, pide al Next.js que
    revalide «/» y, si se pasa slug, también /projects/{slug}.
    No lanza si el frontend no responde (no bloquear el admin).
    """
    secret = getattr(settings, "REVALIDATION_SECRET", None) or ""
    if not secret:
        return
    base = (getattr(settings, "FRONTEND_URL", "") or "").rstrip("/")
    if not base:
        return
    url = f"{base}/api/revalidate"
    body: dict = {}
    if case_study_slug:
        body["slug"] = case_study_slug
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {secret}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status != 200:
                pass
    except (urllib.error.URLError, OSError):
        pass
