from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from core.admin_utils import CopyEnToEsMixin, _admin_display_es_or_en
from core.revalidate_frontend import trigger_frontend_revalidate
from .models import CaseStudy, CaseStudyImage, EngineeringDecision


class EngineeringDecisionInline(admin.TabularInline):
    model = EngineeringDecision
    extra = 0
    fields = ("title", "title_es", "description", "description_es", "tradeoffs", "tradeoffs_es")


class CaseStudyImageInline(admin.TabularInline):
    model = CaseStudyImage
    extra = 0
    fields = ("image", "order", "caption")


@admin.register(CaseStudy)
class CaseStudyAdmin(CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Featured projects shown on the site. "
        "They appear in the «Case studies» section of the portfolio: each has a title, preview, link to its page and a gallery of images (managed in «Case study images» or below)."
    )
    list_display = ("title_display", "slug", "published", "has_images", "created_at")
    list_filter = ("published",)

    def title_display(self, obj):
        return _admin_display_es_or_en(self, obj, "title", "title_es")

    title_display.short_description = _("Title")
    search_fields = ("title", "slug", "title_es")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [EngineeringDecisionInline, CaseStudyImageInline]
    fieldsets = (
        (_("English"), {"fields": ("title", "slug", "summary", "content", "tech")}),
        (_("Español"), {"fields": ("title_es", "summary_es", "content_es", "tech_es")}),
        (_("Common"), {"fields": ("live_url", "metrics", "published")}),
        (
            _("Structured content (EN)"),
            {
                "fields": (
                    "scale_constraints",
                    "rejected_approaches",
                    "what_would_break",
                    "deep_dive",
                    "adrs",
                    "diagram_type",
                    "ascii_diagram",
                ),
                "description": _(
                    "Content shown on the project page when the visitor has selected English. "
                    "Each field has help text below explaining where it appears. Leave empty to use static content from the codebase."
                ),
            },
        ),
        (
            _("Structured content (ES)"),
            {
                "fields": ("scale_constraints_es", "rejected_approaches_es", "what_would_break_es", "deep_dive_es"),
                "description": _(
                    "Content shown when the visitor has selected Spanish. Same structure as the EN fields above. "
                    "If a field is empty here, the site will fall back to static content for that section."
                ),
            },
        ),
    )

    def has_images(self, obj):
        if not obj.pk:
            return False
        return obj.images.exists() or bool(obj.image)

    has_images.boolean = True
    has_images.short_description = _("Images")

    def get_copy_related_names(self):
        return ["engineering_decisions"]

    def get_translate_field_pairs(self):
        return [("title", "title_es"), ("summary", "summary_es"), ("content", "content_es"), ("tech", "tech_es")]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.slug:
            trigger_frontend_revalidate(case_study_slug=obj.slug)


@admin.register(EngineeringDecision)
class EngineeringDecisionAdmin(CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Engineering decisions linked to a case study. "
        "They appear inside each case study page on the site, in the «Architecture & decisions» block."
    )
    list_display = ("title_display", "case_study")

    def title_display(self, obj):
        return _admin_display_es_or_en(self, obj, "title", "title_es", max_len=60)

    title_display.short_description = _("Title")
    list_filter = ("case_study",)
    search_fields = ("title", "description", "title_es")
    fieldsets = (
        (_("Common"), {"fields": ("case_study",)}),
        (_("English"), {"fields": ("title", "description", "tradeoffs")}),
        (_("Español"), {"fields": ("title_es", "description_es", "tradeoffs_es")}),
    )

    def get_translate_field_pairs(self):
        return [("title", "title_es"), ("description", "description_es"), ("tradeoffs", "tradeoffs_es")]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.case_study_id:
            trigger_frontend_revalidate(case_study_slug=obj.case_study.slug)


@admin.register(CaseStudyImage)
class CaseStudyImageAdmin(admin.ModelAdmin):
    list_display = ("image_thumbnail", "case_study", "order", "caption_preview", "created_at")
    list_display_links = ("image_thumbnail", "caption_preview")
    list_filter = ("case_study",)
    search_fields = ("caption", "case_study__title")
    ordering = ("case_study", "order")
    fieldsets = (
        (
            _("Context"),
            {
                "fields": ("case_study",),
                "description": _(
                    "Each image belongs to one case study (project). "
                    "Images are shown in the project page gallery in the order given below."
                ),
            },
        ),
        (_("Image"), {"fields": ("image", "order", "caption")}),
    )

    def image_thumbnail(self, obj):
        if not obj.pk or not obj.image:
            return "—"
        url = obj.image.url
        return format_html(
            '<a href="{}" target="_blank" rel="noopener"><img src="{}" alt="" style="max-height:48px; max-width:80px; object-fit:cover; border-radius:4px; display:block;" /></a>',
            url,
            url,
        )

    image_thumbnail.short_description = _("Image")

    def caption_preview(self, obj):
        return (obj.caption or "—")[:50]

    caption_preview.short_description = _("Caption")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.case_study_id:
            trigger_frontend_revalidate(case_study_slug=obj.case_study.slug)
