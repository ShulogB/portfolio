from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .admin_utils import CopyEnToEsMixin, RevalidateHomeOnSaveMixin, _admin_display_es_or_en
from .models import (
    ContactSubmission,
    PageView,
    ExperienceSummary,
    Principle,
    Technology,
    ExecutiveSnapshot,
    Decision,
    Tradeoff,
    DeepDiveEssay,
    OptimizeFor,
)


# --- Contenido del portfolio ---


@admin.register(ExperienceSummary)
class ExperienceSummaryAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Experience summaries by scope (challenge, decision, impact). "
        "They appear in the «Experience summary» section of the portfolio."
    )
    list_display = ("scope_display", "order", "id")
    list_editable = ("order",)

    def scope_display(self, obj):
        return _admin_display_es_or_en(self, obj, "scope", "scope_es", max_len=60)

    scope_display.short_description = _("Scope")
    search_fields = ("scope", "challenge", "decision", "impact", "scope_es", "challenge_es")
    fieldsets = (
        (_("English"), {"fields": ("scope", "challenge", "decision", "impact", "order")}),
        (_("Español"), {"fields": ("scope_es", "challenge_es", "decision_es", "impact_es")}),
    )

    def get_translate_field_pairs(self):
        return [
            ("scope", "scope_es"),
            ("challenge", "challenge_es"),
            ("decision", "decision_es"),
            ("impact", "impact_es"),
        ]


@admin.register(Principle)
class PrincipleAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Engineering principles (single source of truth, trust boundaries, idempotency, etc.). "
        "They appear in the «Principles» section of the portfolio."
    )
    list_display = ("title_display", "order", "id")
    list_editable = ("order",)

    def title_display(self, obj):
        return _admin_display_es_or_en(self, obj, "title", "title_es")

    title_display.short_description = _("Title")
    search_fields = ("title", "description", "title_es", "description_es")
    fieldsets = (
        (_("English"), {"fields": ("title", "description", "order")}),
        (_("Español"), {"fields": ("title_es", "description_es")}),
    )

    def get_translate_field_pairs(self):
        return [("title", "title_es"), ("description", "description_es")]


@admin.register(Technology)
class TechnologyAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Technologies and tools in your stack. "
        "They appear in the «Stack» (Technologies & Integrations) section of the portfolio."
    )
    list_display = ("name_display", "order", "id")
    list_editable = ("order",)

    def name_display(self, obj):
        return _admin_display_es_or_en(self, obj, "name", "name_es")

    name_display.short_description = _("Name")
    search_fields = ("name", "name_es")
    fieldsets = (
        (_("English"), {"fields": ("name", "order")}),
        (_("Español"), {"fields": ("name_es",)}),
    )

    def get_translate_field_pairs(self):
        return [("name", "name_es")]


@admin.register(ExecutiveSnapshot)
class ExecutiveSnapshotAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Phrases or bullets for the executive summary. "
        "They appear in the «Executive snapshot» section of the portfolio."
    )
    list_display = ("text_display", "order", "id")
    list_editable = ("order",)

    def text_display(self, obj):
        return _admin_display_es_or_en(self, obj, "text", "text_es", max_len=70)

    text_display.short_description = _("Text")
    search_fields = ("text", "text_es")
    fieldsets = (
        (_("English"), {"fields": ("text", "order")}),
        (_("Español"), {"fields": ("text_es",)}),
    )

    def get_translate_field_pairs(self):
        return [("text", "text_es")]


@admin.register(Decision)
class DecisionAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Engineering decisions (short list on the site). "
        "They appear in the «Decisions» section of the portfolio."
    )
    list_display = ("text_preview", "order", "id")
    list_editable = ("order",)
    search_fields = ("text", "text_es")
    fieldsets = (
        (_("English"), {"fields": ("text", "order")}),
        (_("Español"), {"fields": ("text_es",)}),
    )

    def get_translate_field_pairs(self):
        return [("text", "text_es")]

    def text_preview(self, obj):
        return _admin_display_es_or_en(self, obj, "text", "text_es", max_len=70)

    text_preview.short_description = _("Decision")


@admin.register(Tradeoff)
class TradeoffAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Explicit trade-offs: what was decided, gained, and sacrificed. "
        "They appear in the «Explicit tradeoffs» section of the portfolio."
    )
    list_display = ("decision_display", "order", "id")
    list_editable = ("order",)

    def decision_display(self, obj):
        return _admin_display_es_or_en(self, obj, "decision", "decision_es", max_len=70)

    decision_display.short_description = _("Decision")
    search_fields = ("decision", "gained", "sacrificed", "decision_es", "gained_es", "sacrificed_es")
    fieldsets = (
        (_("English"), {"fields": ("decision", "gained", "sacrificed", "order")}),
        (_("Español"), {"fields": ("decision_es", "gained_es", "sacrificed_es")}),
    )

    def get_translate_field_pairs(self):
        return [
            ("decision", "decision_es"),
            ("gained", "gained_es"),
            ("sacrificed", "sacrificed_es"),
        ]


@admin.register(DeepDiveEssay)
class DeepDiveEssayAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "Long essay for the «Architecture & Design (deep dive)» section. "
        "It appears in the portfolio as the main text explaining your approach to architecture and design."
    )
    list_display = ("title_display", "id")

    def title_display(self, obj):
        return _admin_display_es_or_en(self, obj, "title", "title_es")

    title_display.short_description = _("Title")
    search_fields = ("title", "paragraphs", "title_es", "paragraphs_es")
    fieldsets = (
        (_("English"), {"fields": ("title", "paragraphs")}),
        (_("Español"), {"fields": ("title_es", "paragraphs_es")}),
    )

    def get_translate_field_pairs(self):
        return [("title", "title_es"), ("paragraphs", "paragraphs_es")]


@admin.register(OptimizeFor)
class OptimizeForAdmin(RevalidateHomeOnSaveMixin, CopyEnToEsMixin, admin.ModelAdmin):
    change_list_description = _(
        "«Optimize for» items (what you prioritize: correctness, observability, etc.). "
        "They appear in the «Optimize for» section of the portfolio."
    )
    list_display = ("title_display", "order", "id")
    list_editable = ("order",)

    def title_display(self, obj):
        return _admin_display_es_or_en(self, obj, "title", "title_es")

    title_display.short_description = _("Title")
    search_fields = ("title", "explanation", "title_es", "explanation_es")
    fieldsets = (
        (_("English"), {"fields": ("title", "explanation", "order")}),
        (_("Español"), {"fields": ("title_es", "explanation_es")}),
    )

    def get_translate_field_pairs(self):
        return [("title", "title_es"), ("explanation", "explanation_es")]


# --- Sitio: visitas y contactos ---


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    change_list_description = _(
        "Messages sent from the portfolio contact form. "
        "Internal use only; they are not shown on the site. Metrics appear on the admin Home."
    )
    list_display = ("name", "email", "source", "read", "created_at")
    list_filter = ("read", "created_at")
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    change_list_description = _(
        "Page views by path (traffic metrics). "
        "Used for the chart and list on the admin Home; not shown on the public site."
    )
    list_display = ("path", "created_at")
    list_filter = ("path",)
    date_hierarchy = "created_at"
    readonly_fields = ("path", "created_at")

    def has_add_permission(self, request):
        """Las visitas se registran automáticamente; no se añaden a mano."""
        return False
