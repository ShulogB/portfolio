from django import template
from django.db.models import Count

register = template.Library()


@register.simple_tag
def admin_change_list_description(cl):
    """Devuelve change_list_description del ModelAdmin si existe."""
    if cl is None:
        return ""
    return getattr(cl.model_admin, "change_list_description", "") or ""


@register.simple_tag
def admin_has_spanish_fields(cl):
    """True si el modelo tiene campos _es (contenido en español)."""
    if cl is None:
        return False
    return any(f.name.endswith("_es") for f in cl.opts.model._meta.get_fields() if getattr(f, "name", ""))


@register.inclusion_tag("admin/dashboard_metrics.html", takes_context=False)
def show_dashboard_metrics():
    from core.models import ContactSubmission, PageView

    recent_contacts = list(ContactSubmission.objects.all()[:10])
    recent_page_views = list(PageView.objects.all()[:20])
    contact_count = ContactSubmission.objects.count()
    page_view_count = PageView.objects.count()
    views_by_path = list(
        PageView.objects.values("path")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )
    return {
        "recent_contacts": recent_contacts,
        "recent_page_views": recent_page_views,
        "contact_count": contact_count,
        "page_view_count": page_view_count,
        "views_by_path": views_by_path,
    }
