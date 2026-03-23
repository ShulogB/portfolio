from rest_framework import serializers
from .models import ContactSubmission, PageView


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ("name", "email", "message", "source")


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = ("path",)

    def validate_path(self, value):
        if not value or not value.strip():
            return "/"
        return value.strip()
