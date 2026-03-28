"""Serializers públicos para el bundle GET /api/v1/portfolio-content/."""

from rest_framework import serializers

from case_studies.models import CaseStudy
from case_studies.serializers import CaseStudyImageSerializer, _build_media_url

from .models import (
    Decision,
    DeepDiveEssay,
    ExecutiveSnapshot,
    ExperienceSummary,
    OptimizeFor,
    Principle,
    Technology,
    Tradeoff,
)


class ExecutiveSnapshotRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutiveSnapshot
        fields = ("id", "text", "text_es", "order")


class ExperienceSummaryRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceSummary
        fields = (
            "id",
            "scope",
            "challenge",
            "decision",
            "impact",
            "scope_es",
            "challenge_es",
            "decision_es",
            "impact_es",
            "order",
        )


class PrincipleRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Principle
        fields = ("id", "title", "description", "title_es", "description_es", "order")


class TechnologyRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = ("id", "name", "name_es", "order")


class DecisionRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decision
        fields = ("id", "text", "text_es", "order")


class TradeoffRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tradeoff
        fields = (
            "id",
            "decision",
            "gained",
            "sacrificed",
            "decision_es",
            "gained_es",
            "sacrificed_es",
            "order",
        )


def _paragraphs_to_list(text: str) -> list[str]:
    if not text or not str(text).strip():
        return []
    return [line.strip() for line in str(text).splitlines() if line.strip()]


class DeepDiveEssayRowSerializer(serializers.ModelSerializer):
    paragraphs = serializers.SerializerMethodField()
    paragraphs_es = serializers.SerializerMethodField()

    class Meta:
        model = DeepDiveEssay
        fields = ("id", "title", "title_es", "paragraphs", "paragraphs_es")

    def get_paragraphs(self, obj):
        return _paragraphs_to_list(obj.paragraphs)

    def get_paragraphs_es(self, obj):
        return _paragraphs_to_list(obj.paragraphs_es)


class OptimizeForRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptimizeFor
        fields = ("id", "title", "explanation", "title_es", "explanation_es", "order")


class CaseStudyHomeSerializer(serializers.ModelSerializer):
    """Campos mínimos para home + carrusel (solo publicados en la vista)."""

    images = CaseStudyImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = (
            "slug",
            "title",
            "title_es",
            "summary",
            "summary_es",
            "tech",
            "tech_es",
            "live_url",
            "adrs",
            "diagram_type",
            "image_url",
            "images",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        first = obj.images.first()
        if first and first.image:
            return _build_media_url(request, first.image.url)
        if obj.image:
            return _build_media_url(request, obj.image.url)
        return None
