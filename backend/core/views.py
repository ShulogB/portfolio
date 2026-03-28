from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from case_studies.models import CaseStudy

from .models import (
    ContactSubmission,
    Decision,
    DeepDiveEssay,
    ExecutiveSnapshot,
    ExperienceSummary,
    OptimizeFor,
    PageView,
    Principle,
    Technology,
    Tradeoff,
)
from .portfolio_serializers import (
    CaseStudyHomeSerializer,
    DecisionRowSerializer,
    DeepDiveEssayRowSerializer,
    ExecutiveSnapshotRowSerializer,
    ExperienceSummaryRowSerializer,
    OptimizeForRowSerializer,
    PrincipleRowSerializer,
    TechnologyRowSerializer,
    TradeoffRowSerializer,
)
from .serializers import ContactSubmissionSerializer, PageViewSerializer


class HealthCheckView(APIView):
    """GET: endpoint liviano para healthchecks de infraestructura."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class ContactThrottle(AnonRateThrottle):
    rate = "10/hour"


class TrackThrottle(AnonRateThrottle):
    rate = "30/minute"


class ContactCreateView(APIView):
    """POST: crear mensaje de contacto (público, throttled)."""
    permission_classes = [AllowAny]
    throttle_classes = [ContactThrottle]

    def post(self, request):
        serializer = ContactSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Message sent."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrackPageViewView(APIView):
    """POST: registrar una visita a una ruta (público, throttled)."""
    permission_classes = [AllowAny]
    throttle_classes = [TrackThrottle]

    def post(self, request):
        data = dict(request.data)
        # Asegurar path: si falta o está vacío, usar "/"
        if not data.get("path") or not str(data.get("path", "")).strip():
            data["path"] = "/"
        serializer = PageViewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "OK"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PortfolioContentView(APIView):
    """
    GET: contenido editable del portfolio (admin → DB) para el sitio público.
    Sin fallback en el front: listas vacías si aún no hay datos.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        ctx = {"request": request}
        published = CaseStudy.objects.filter(published=True).prefetch_related("images").order_by("slug")
        data = {
            "executive_snapshot": ExecutiveSnapshotRowSerializer(
                ExecutiveSnapshot.objects.all(), many=True, context=ctx
            ).data,
            "experience_summary": ExperienceSummaryRowSerializer(
                ExperienceSummary.objects.all(), many=True, context=ctx
            ).data,
            "principles": PrincipleRowSerializer(Principle.objects.all(), many=True, context=ctx).data,
            "technologies": TechnologyRowSerializer(Technology.objects.all(), many=True, context=ctx).data,
            "decisions": DecisionRowSerializer(Decision.objects.all(), many=True, context=ctx).data,
            "tradeoffs": TradeoffRowSerializer(Tradeoff.objects.all(), many=True, context=ctx).data,
            "deep_dive_essays": DeepDiveEssayRowSerializer(
                DeepDiveEssay.objects.all(), many=True, context=ctx
            ).data,
            "optimize_for": OptimizeForRowSerializer(OptimizeFor.objects.all(), many=True, context=ctx).data,
            "case_studies": CaseStudyHomeSerializer(published, many=True, context=ctx).data,
        }
        return Response(data)
