from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class CaseStudiesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "case_studies"
    verbose_name = _("Case studies")
