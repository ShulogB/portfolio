from rest_framework import permissions

from users.models import User


class CaseStudyWriteAdminOnly(permissions.BasePermission):
    """
    Read-only for everyone. Create/update/delete only for users with role ADMIN.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN
