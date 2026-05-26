import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import ContactSubmission, PageView
from .serializers import ContactSubmissionSerializer, PageViewSerializer

logger = logging.getLogger(__name__)


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
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        submission: ContactSubmission = serializer.save()
        self._send_notification(submission)

        return Response({"detail": "Message sent."}, status=status.HTTP_201_CREATED)

    def _send_notification(self, submission: ContactSubmission) -> None:
        """Envía email de notificación al dueño del portfolio. Silencia errores para no romper la respuesta."""
        to_email = getattr(settings, "CONTACT_NOTIFICATION_EMAIL", "")
        if not to_email:
            logger.warning("CONTACT_NOTIFICATION_EMAIL not set — skipping notification email.")
            return

        subject = f"[Portfolio] Nuevo mensaje de {submission.name}"
        body = (
            f"Nombre:  {submission.name}\n"
            f"Email:   {submission.email}\n"
            f"Fuente:  {submission.source or '—'}\n"
            f"Fecha:   {submission.created_at.strftime('%Y-%m-%d %H:%M UTC')}\n"
            f"\n"
            f"Mensaje:\n{submission.message}\n"
        )

        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info("Contact notification sent to %s", to_email)
        except Exception as exc:
            # Email falla → logueamos pero NO fallamos la respuesta al usuario.
            logger.error("Failed to send contact notification: %s", exc)


class TrackPageViewView(APIView):
    """POST: registrar una visita a una ruta (público, throttled)."""
    permission_classes = [AllowAny]
    throttle_classes = [TrackThrottle]

    def post(self, request):
        data = dict(request.data)
        if not data.get("path") or not str(data.get("path", "")).strip():
            data["path"] = "/"
        serializer = PageViewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "OK"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
