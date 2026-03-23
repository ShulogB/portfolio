from django.db import models
from django.utils.translation import gettext_lazy as _


class ContactSubmission(models.Model):
    """Mensajes enviados desde el formulario de contacto del portfolio."""

    name = models.CharField(_("name"), max_length=255)
    email = models.EmailField(_("email"))
    message = models.TextField(_("message"))
    source = models.CharField(_("source"), max_length=100, blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    read = models.BooleanField(_("read"), default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Contact submission")
        verbose_name_plural = _("Contact submissions")

    def __str__(self):
        return f"{self.email} – {self.created_at.date()}"


class PageView(models.Model):
    """Registro de visitas por ruta (métricas de tráfico)."""

    path = models.CharField(_("path"), max_length=500)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Page view")
        verbose_name_plural = _("Page views")

    def __str__(self):
        return f"{self.path} @ {self.created_at}"


# --- Contenido editable del portfolio (lo que se muestra en la web) ---


class ExperienceSummary(models.Model):
    """Una fila de la sección Experience summary (scope, challenge, decision, impact)."""

    scope = models.CharField(_("Scope"), max_length=255, help_text=_("E.g.: patagoniadreams.com.ar — reservation availability"))
    challenge = models.TextField(_("Challenge"))
    decision = models.TextField(_("Decision"))
    impact = models.TextField(_("Impact"))
    scope_es = models.CharField(_("Scope"), max_length=255, blank=True)
    challenge_es = models.TextField(_("Challenge"), blank=True)
    decision_es = models.TextField(_("Decision"), blank=True)
    impact_es = models.TextField(_("Impact"), blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Experience summary (row)")
        verbose_name_plural = _("Experience summary")

    def __str__(self):
        return self.scope[:60] + ("…" if len(self.scope) > 60 else "")


class Principle(models.Model):
    """Principio de ingeniería (Engineering principles)."""

    title = models.CharField(_("Title"), max_length=255)
    description = models.TextField(_("Description"))
    title_es = models.CharField(_("Title"), max_length=255, blank=True)
    description_es = models.TextField(_("Description"), blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Principle")
        verbose_name_plural = _("Engineering principles")

    def __str__(self):
        return self.title


class Technology(models.Model):
    """Tecnología/herramienta para la sección Technologies & Integrations (stack)."""

    name = models.CharField(_("Name"), max_length=120)
    name_es = models.CharField(_("Name"), max_length=120, blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = _("Technology")
        verbose_name_plural = _("Technologies & Integrations")

    def __str__(self):
        return self.name


class ExecutiveSnapshot(models.Model):
    """Una viñeta del Executive Snapshot."""

    text = models.CharField(_("Text"), max_length=500)
    text_es = models.CharField(_("Text"), max_length=500, blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Executive snapshot (bullet)")
        verbose_name_plural = _("Executive snapshot")

    def __str__(self):
        return self.text[:60] + ("…" if len(self.text) > 60 else "")


class Decision(models.Model):
    """Selected engineering decision (texto suelto)."""

    text = models.TextField(_("Text"))
    text_es = models.TextField(_("Text"), blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Decision")
        verbose_name_plural = _("Selected engineering decisions")

    def __str__(self):
        return self.text[:80] + ("…" if len(self.text) > 80 else "")


class Tradeoff(models.Model):
    """Explicit tradeoff: decision, gained, sacrificed."""

    decision = models.CharField(_("Decision"), max_length=500)
    gained = models.TextField(_("Gained"))
    sacrificed = models.TextField(_("Sacrificed"))
    decision_es = models.CharField(_("Decision"), max_length=500, blank=True)
    gained_es = models.TextField(_("Gained"), blank=True)
    sacrificed_es = models.TextField(_("Sacrificed"), blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Tradeoff")
        verbose_name_plural = _("Explicit tradeoffs")

    def __str__(self):
        return self.decision[:60] + ("…" if len(self.decision) > 60 else "")


class DeepDiveEssay(models.Model):
    """Ensayo de Architecture & Design (título + párrafos)."""

    title = models.CharField(_("Title"), max_length=255)
    paragraphs = models.TextField(
        _("Paragraphs"),
        help_text=_("One paragraph per line. Empty lines are preserved."),
    )
    title_es = models.CharField(_("Title"), max_length=255, blank=True)
    paragraphs_es = models.TextField(_("Paragraphs"), blank=True)

    class Meta:
        ordering = ["id"]
        verbose_name = _("Deep dive essay")
        verbose_name_plural = _("Architecture & Design (deep dive)")

    def __str__(self):
        return self.title


class OptimizeFor(models.Model):
    """Qué optimizo (What I Optimize For): título + explicación."""

    title = models.CharField(_("Title"), max_length=255)
    explanation = models.TextField(_("Explanation"))
    title_es = models.CharField(_("Title"), max_length=255, blank=True)
    explanation_es = models.TextField(_("Explanation"), blank=True)
    order = models.PositiveIntegerField(_("Order"), default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Optimize for")
        verbose_name_plural = _("What I Optimize For")

    def __str__(self):
        return self.title
