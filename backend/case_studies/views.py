from rest_framework import viewsets

from users.models import User

from .models import CaseStudy
from .serializers import CaseStudySerializer
from .permissions import CaseStudyWriteAdminOnly


class CaseStudyViewSet(viewsets.ModelViewSet):
    serializer_class = CaseStudySerializer
    permission_classes = [CaseStudyWriteAdminOnly]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        qs = CaseStudy.objects.all().prefetch_related("images", "engineering_decisions")
        user = self.request.user
        if not user.is_authenticated or getattr(user, "role", None) != User.Role.ADMIN:
            qs = qs.filter(published=True)
        return qs
