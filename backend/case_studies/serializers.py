from rest_framework import serializers
from .models import CaseStudy, CaseStudyImage, EngineeringDecision


def _build_media_url(request, url):
    if request and url:
        return request.build_absolute_uri(url)
    return url or None


class CaseStudyImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudyImage
        fields = ("id", "url", "order", "caption")

    def get_url(self, obj):
        request = self.context.get("request")
        return _build_media_url(request, obj.image.url if obj.image else None)


class EngineeringDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngineeringDecision
        fields = (
            "id",
            "title",
            "title_es",
            "description",
            "description_es",
            "tradeoffs",
            "tradeoffs_es",
        )


class CaseStudySerializer(serializers.ModelSerializer):
    engineering_decisions = EngineeringDecisionSerializer(many=True, read_only=True)
    images = CaseStudyImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = (
            "id",
            "title",
            "title_es",
            "slug",
            "summary",
            "summary_es",
            "content",
            "content_es",
            "tech",
            "tech_es",
            "live_url",
            "scale_constraints",
            "scale_constraints_es",
            "rejected_approaches",
            "rejected_approaches_es",
            "what_would_break",
            "what_would_break_es",
            "deep_dive",
            "deep_dive_es",
            "adrs",
            "diagram_type",
            "ascii_diagram",
            "image_url",
            "images",
            "metrics",
            "published",
            "created_at",
            "updated_at",
            "engineering_decisions",
        )
        read_only_fields = ("slug", "created_at", "updated_at")

    def get_image_url(self, obj):
        """Primera imagen de la galería o imagen legacy (una por case study)."""
        request = self.context.get("request")
        first = obj.images.first()
        if first and first.image:
            return _build_media_url(request, first.image.url)
        if obj.image:
            return _build_media_url(request, obj.image.url)
        return None
