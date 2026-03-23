"""
URL configuration for portfolio_api project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models import Count
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# "View site" en el admin abre el frontend (portfolio), no la raíz del backend.
admin.site.site_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")

# Ocultar Authentication & Authorization y Users del sidebar del admin (solo contenido del portfolio).
admin.site.unregister(Group)
admin.site.unregister(get_user_model())


_original_admin_index = admin.site.index


def _index_with_metrics(request, extra_context=None):
    """Wrapper del index del admin que inyecta métricas (contactos, visitas) en el contexto."""
    from core.models import ContactSubmission, PageView

    extra = extra_context or {}
    extra["recent_contacts"] = list(ContactSubmission.objects.all()[:10])
    extra["contact_count"] = ContactSubmission.objects.count()
    extra["page_view_count"] = PageView.objects.count()
    extra["views_by_path"] = list(
        PageView.objects.values("path")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )
    return _original_admin_index(request, extra_context=extra)


admin.site.index = _index_with_metrics

urlpatterns = [
    path("i18n/", include("django.conf.urls.i18n")),
    path("admin/", admin.site.urls),
    path("api/v1/", include("core.urls")),
    path("api/v1/", include("case_studies.urls")),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
