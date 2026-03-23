from django.db import models
from django.utils.translation import gettext_lazy as _


class CaseStudy(models.Model):
    title = models.CharField(_("Title"), max_length=255)
    slug = models.SlugField(_("Slug"), unique=True)
    summary = models.TextField(_("Summary"))
    content = models.TextField(_("Content"))
    title_es = models.CharField(_("Title"), max_length=255, blank=True)
    summary_es = models.TextField(_("Summary"), blank=True)
    content_es = models.TextField(_("Content"), blank=True)
    tech = models.CharField(_("Tech (EN)"), max_length=500, blank=True, help_text=_("Tags under title, e.g. Payments • Webhooks • Concurrency"))
    tech_es = models.CharField(_("Tech (ES)"), max_length=500, blank=True)
    live_url = models.CharField(_("Live site URL"), max_length=500, blank=True, help_text=_("URL del sitio en vivo; vacío o # si no aplica."))
    image = models.ImageField(_("Image"), upload_to="case_studies/", blank=True, null=True)
    metrics = models.JSONField(_("Metrics"), blank=True, default=dict)
    # Structured content (optional; front falls back to static lib/projects.ts when empty)
    # EN fields: shown when the user has selected English on the project page. ES fields: when Spanish.
    scale_constraints = models.JSONField(
        _("Scale constraints (EN)"),
        blank=True,
        default=dict,
        help_text=_(
            "Shown in the «Scale & Constraints» section when the site is in English. "
            'JSON: {"requestVolume":"","concurrency":"","externalDependencies":"","failureModes":"","dataConsistency":""}'
        ),
    )
    scale_constraints_es = models.JSONField(
        _("Scale constraints (ES)"),
        blank=True,
        default=dict,
        help_text=_("Same structure as EN. Shown when the site is in Spanish."),
    )
    rejected_approaches = models.JSONField(
        _("Rejected approaches (EN)"),
        blank=True,
        default=list,
        help_text=_(
            "Shown in the «What was explicitly rejected» section when the site is in English. "
            'JSON: [{"approach":"","reason":""}]'
        ),
    )
    rejected_approaches_es = models.JSONField(
        _("Rejected approaches (ES)"),
        blank=True,
        default=list,
        help_text=_("Same structure as EN. Shown when the site is in Spanish."),
    )
    what_would_break = models.JSONField(
        _("What would break (EN)"),
        blank=True,
        default=list,
        help_text=_(
            "Shown in the «What would break this system?» section when the site is in English. "
            'JSON: ["string", ...]'
        ),
    )
    what_would_break_es = models.JSONField(
        _("What would break (ES)"),
        blank=True,
        default=list,
        help_text=_("Same structure as EN. Shown when the site is in Spanish."),
    )
    deep_dive = models.JSONField(
        _("Deep dive (EN)"),
        blank=True,
        default=list,
        help_text=_(
            "Shown in the «Deep dive» section when the site is in English. "
            'JSON: [{"title":"","paragraphs":["",...]}]'
        ),
    )
    deep_dive_es = models.JSONField(
        _("Deep dive (ES)"),
        blank=True,
        default=list,
        help_text=_("Same structure as EN. Shown when the site is in Spanish."),
    )
    adrs = models.JSONField(
        _("ADRs"),
        blank=True,
        default=list,
        help_text=_(
            "Architecture Decision Records links. Shown if you add an ADR block to the project page. "
            'JSON: [{"title":"","href":""}]'
        ),
    )
    diagram_type = models.CharField(
        _("Diagram type"),
        max_length=32,
        blank=True,
        help_text=_(
            "Defines which diagram is shown in the «Architecture & Design» section: use \"payments\" or \"identity\". "
            "Leave empty to use the value from static content."
        ),
    )
    ascii_diagram = models.TextField(
        _("ASCII diagram"),
        blank=True,
        help_text=_("Optional ASCII diagram shown under the overview text on the project page."),
    )
    published = models.BooleanField(_("Published"), default=False)
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Case study")
        verbose_name_plural = _("Case studies")

    def __str__(self):
        return self.title


class CaseStudyImage(models.Model):
    """Varias imágenes por case study (galería por proyecto)."""
    case_study = models.ForeignKey(
        CaseStudy,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(_("Image"), upload_to="case_studies/gallery/")
    order = models.PositiveIntegerField(_("Order"), default=0)
    caption = models.CharField(_("Caption"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Case study image")
        verbose_name_plural = _("Case study images")

    def __str__(self):
        return f"{self.case_study.slug} #{self.order}"


class EngineeringDecision(models.Model):
    case_study = models.ForeignKey(
        CaseStudy,
        on_delete=models.CASCADE,
        related_name="engineering_decisions",
    )
    title = models.CharField(_("Title"), max_length=255)
    description = models.TextField(_("Description"))
    tradeoffs = models.TextField(_("Tradeoffs"), blank=True)
    title_es = models.CharField(_("Title"), max_length=255, blank=True)
    description_es = models.TextField(_("Description"), blank=True)
    tradeoffs_es = models.TextField(_("Tradeoffs"), blank=True)

    class Meta:
        ordering = ["id"]
        verbose_name = _("Engineering decision")
        verbose_name_plural = _("Engineering decisions")

    def __str__(self):
        return self.title
