from django.urls import path
from .views import ContactCreateView, TrackPageViewView, HealthCheckView, PortfolioContentView

urlpatterns = [
    path("portfolio-content/", PortfolioContentView.as_view(), name="portfolio-content"),
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("contact/", ContactCreateView.as_view(), name="contact-create"),
    path("track/", TrackPageViewView.as_view(), name="track-pageview"),
]
