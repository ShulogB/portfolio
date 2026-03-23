from django.urls import path
from .views import ContactCreateView, TrackPageViewView

urlpatterns = [
    path("contact/", ContactCreateView.as_view(), name="contact-create"),
    path("track/", TrackPageViewView.as_view(), name="track-pageview"),
]
