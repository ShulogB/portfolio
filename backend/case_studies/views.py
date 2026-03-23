from rest_framework import viewsets
from .models import CaseStudy
from .serializers import CaseStudySerializer
from .permissions import CaseStudyWriteAdminOnly


class CaseStudyViewSet(viewsets.ModelViewSet):
    queryset = CaseStudy.objects.all()
    serializer_class = CaseStudySerializer
    permission_classes = [CaseStudyWriteAdminOnly]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"
