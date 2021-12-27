"""whereintheworld URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import decorators, exceptions

from .api.urls import urlpatterns as api_url_patterns


@decorators.api_view(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"])
@decorators.authentication_classes([])
@decorators.permission_classes([])
def api_not_found(request):
    raise exceptions.NotFound(detail="Not found.")


urlpatterns = [
    path("admin/", admin.site.urls),
    *api_url_patterns,
    path("", include("social_django.urls", namespace="social")),
    re_path(r"^api.+", api_not_found),
]
