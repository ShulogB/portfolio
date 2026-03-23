"""
Tests del endpoint público POST /api/v1/contact/ (throttle 10/h).
"""
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import ContactSubmission


class ContactApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/contact/"

    def test_post_valid_returns_201_and_creates_submission(self):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "Hello from tests",
            "source": "home",
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactSubmission.objects.count(), 1)
        row = ContactSubmission.objects.first()
        self.assertEqual(row.name, "Test User")
        self.assertEqual(row.email, "test@example.com")
        self.assertEqual(row.message, "Hello from tests")

    def test_post_invalid_email_returns_400(self):
        payload = {
            "name": "Test",
            "email": "not-an-email",
            "message": "Hi",
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_missing_required_fields_returns_400(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
