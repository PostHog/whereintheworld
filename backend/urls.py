"""whereintheworld URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import decorators, exceptions

from backend.utils import render_template

from .api.urls import urlpatterns as api_url_patterns


@decorators.api_view(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"])
@decorators.authentication_classes([])
@decorators.permission_classes([])
def api_not_found(request):
    raise exceptions.NotFound(detail="Not found.")


def frontend(request, *args, **kwargs):
    return render_template("index.html", request)


urlpatterns = [
    path("admin/", admin.site.urls),
    *api_url_patterns,
    path("", include("social_django.urls", namespace="social")),
    re_path(r"^api.+", api_not_found),
    re_path(r"^.*", frontend),
]
