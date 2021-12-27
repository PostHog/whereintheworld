from rest_framework import permissions


class YourTripsOnlyPermission(permissions.BasePermission):
    message = "You cannot modify or delete someone else's trip."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class YourMatchesOnlyPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.source_user == request.user or obj.target_user == request.user
