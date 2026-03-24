from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import ContactSubmission, PageView
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
