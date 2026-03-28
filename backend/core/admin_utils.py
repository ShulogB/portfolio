"""
Utilidades para el admin: copiar campos EN → ES y traducción automática EN → ES.
"""

from django.contrib.admin.templatetags.admin_urls import add_preserved_filters
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.utils.translation import gettext_lazy as _


def _translate_text_en_to_es(text):
    """Traduce texto de inglés a español usando deep_translator (sin API key)."""
    if not text or not str(text).strip():
        return ""
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        return ""
    text = str(text).strip()
    # Google tiene límite ~5000 caracteres por request; troceamos por párrafos o 4000 chars
    max_chunk = 4000
    if len(text) <= max_chunk:
        try:
            return GoogleTranslator(source="en", target="es").translate(text=text) or text
        except Exception:
            return text
    parts = []
    start = 0
    while start < len(text):
        end = start + max_chunk
        if end < len(text):
            # Cortar en el último salto de línea o espacio
            chunk = text[start:end]
            last_break = max(chunk.rfind("\n"), chunk.rfind(". "), chunk.rfind(" "))
            if last_break > max_chunk // 2:
                end = start + last_break + 1
        chunk = text[start:end]
        try:
            parts.append(GoogleTranslator(source="en", target="es").translate(text=chunk) or chunk)
        except Exception:
            parts.append(chunk)
        start = end
    return "\n\n".join(parts) if parts else text


def translate_en_to_es(instance, field_pairs):
    """
    field_pairs: lista de (nombre_campo_origen, nombre_campo_destino), ej. [("title", "title_es"), ...].
    Traduce el valor de cada campo origen al destino (en → es) y guarda.
    """
    for src_name, tgt_name in field_pairs:
        if not hasattr(instance, src_name) or not hasattr(instance, tgt_name):
            continue
        value = getattr(instance, src_name)
        if not value:
            continue
        translated = _translate_text_en_to_es(value)
        if translated:
            setattr(instance, tgt_name, translated)
    instance.save()


def copy_en_to_es(instance, related_names=None):
    """
    Copia el valor de cada campo en inglés al campo _es correspondiente.
    Si related_names está definido, también copia en los objetos relacionados
    (ej.: para CaseStudy, related_names=['engineering_decisions']).
    """
    related_names = related_names or []
    model = instance.__class__
    # Campos concretos que terminan en _es
    for f in model._meta.get_fields():
        if not hasattr(f, "name") or not f.name.endswith("_es"):
            continue
        if getattr(f, "many_to_many", False) or getattr(f, "one_to_many", False):
            continue
        if not f.concrete:
            continue
        source_name = f.name[:-3]  # quitar _es
        if not hasattr(model, source_name):
            continue
        try:
            value = getattr(instance, source_name)
            setattr(instance, f.name, value)
        except AttributeError:
            pass
    instance.save()

    for rel_name in related_names:
        manager = getattr(instance, rel_name, None)
        if manager is None:
            continue
        try:
            for rel_obj in manager.all():
                copy_en_to_es(rel_obj, related_names=())
        except Exception:
            pass


def _admin_display_es_or_en(admin, obj, en_attr, es_attr, max_len=None):
    """Devuelve el valor en español si el idioma del request es ES y existe, sino el inglés."""
    request = getattr(admin, "_request", None)
    if request and getattr(request, "LANGUAGE_CODE", "").startswith("es"):
        val = getattr(obj, es_attr, None)
        if val and str(val).strip():
            if max_len:
                val = str(val)[:max_len] + ("…" if len(str(val)) > max_len else "")
            return val
    val = getattr(obj, en_attr, None) or ""
    if max_len and val:
        val = str(val)[:max_len] + ("…" if len(str(val)) > max_len else "")
    return val


class CopyEnToEsMixin:
    """Mixin para ModelAdmin: botón Copiar EN→ES, botón Traducir EN→ES y vistas."""

    change_form_template = "admin/copy_en_to_es_change_form.html"

    def changelist_view(self, request, *args, **kwargs):
        self._request = request
        return super().changelist_view(request, *args, **kwargs)

    def get_copy_related_names(self):
        """Nombres de relaciones a copiar también (ej. ['engineering_decisions'] para CaseStudy)."""
        return []

    def get_translate_field_pairs(self):
        """
        Lista de (campo_origen, campo_destino) para traducción automática.
        Ej.: [("title", "title_es"), ("summary", "summary_es"), ("content", "content_es")].
        Si está vacía, no se muestra el botón «Traducir desde inglés».
        """
        return []

    def get_urls(self):
        urls = super().get_urls()
        info = self.model._meta.app_label, self.model._meta.model_name
        custom = [
            path(
                "<path:object_id>/copy-en-to-es/",
                self.admin_site.admin_view(self.copy_en_to_es_view),
                name="%s_%s_copy_en_to_es" % info,
            ),
            path(
                "<path:object_id>/translate-en-to-es/",
                self.admin_site.admin_view(self.translate_en_to_es_view),
                name="%s_%s_translate_en_to_es" % info,
            ),
        ]
        return custom + urls

    def copy_en_to_es_view(self, request, object_id):
        obj = self.get_object(request, object_id)
        if obj is None:
            return self._get_obj_does_not_exist_redirect(request, self.model._meta, object_id)
        if not self.has_change_permission(request, obj):
            raise PermissionDenied
        copy_en_to_es(obj, related_names=self.get_copy_related_names())
        self.message_user(request, _("English content copied to Spanish. You can now edit the Spanish fields."))
        opts = self.model._meta
        redirect_url = reverse(
            "admin:%s_%s_change" % (opts.app_label, opts.model_name),
            args=[object_id],
            current_app=self.admin_site.name,
        )
        preserved_filters = self.get_preserved_filters(request)
        if preserved_filters:
            redirect_url = add_preserved_filters({"preserved_filters": preserved_filters, "opts": opts}, redirect_url)
        return HttpResponseRedirect(redirect_url)

    def translate_en_to_es_view(self, request, object_id):
        obj = self.get_object(request, object_id)
        if obj is None:
            return self._get_obj_does_not_exist_redirect(request, self.model._meta, object_id)
        if not self.has_change_permission(request, obj):
            raise PermissionDenied
        field_pairs = self.get_translate_field_pairs()
        if not field_pairs:
            self.message_user(request, _("Translation is not configured for this model."), level="warning")
        else:
            translate_en_to_es(obj, field_pairs=field_pairs)
            self.message_user(request, _("Content translated from English to Spanish. You can review and edit the Spanish fields."))
        opts = self.model._meta
        redirect_url = reverse(
            "admin:%s_%s_change" % (opts.app_label, opts.model_name),
            args=[object_id],
            current_app=self.admin_site.name,
        )
        preserved_filters = self.get_preserved_filters(request)
        if preserved_filters:
            redirect_url = add_preserved_filters({"preserved_filters": preserved_filters, "opts": opts}, redirect_url)
        return HttpResponseRedirect(redirect_url)

    def change_view(self, request, object_id, form_url="", extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            info = self.model._meta.app_label, self.model._meta.model_name
            extra_context["copy_en_to_es_url"] = reverse(
                "admin:%s_%s_copy_en_to_es" % (*info,),
                args=[object_id],
                current_app=self.admin_site.name,
            )
            if self.get_translate_field_pairs():
                extra_context["translate_en_to_es_url"] = reverse(
                    "admin:%s_%s_translate_en_to_es" % (*info,),
                    args=[object_id],
                    current_app=self.admin_site.name,
                )
        return super().change_view(request, object_id, form_url, extra_context)


class RevalidateHomeOnSaveMixin:
    """Después de guardar, avisa al frontend para revalidar la home (contenido desde API)."""

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        from core.revalidate_frontend import trigger_frontend_revalidate

        trigger_frontend_revalidate(case_study_slug=None)
