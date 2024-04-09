"""whereintheworld URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
"""

from functools import wraps

from django.conf import settings
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required as base_login_required
from django.shortcuts import redirect
from django.urls import include, path, re_path
from rest_framework import decorators, exceptions

from backend.utils import render_template

from .api.urls import urlpatterns as api_url_patterns
from .views import health_check


@decorators.api_view(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"])
@decorators.authentication_classes([])
@decorators.permission_classes([])
def api_not_found(request):
    raise exceptions.NotFound(detail="Not found.")


def frontend(request, *args, **kwargs):
    return render_template("index.html", request)


def login_required(view):
    base_handler = base_login_required(view)

    @wraps(view)
    def handler(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            if settings.SOCIAL_AUTH_GITHUB_KEY:
                return redirect("/login/github/")
            return redirect("/login/google-oauth2/")
        return base_handler(request, *args, **kwargs)

    return handler


urlpatterns = [
    path("_health", health_check),
    path("admin/", admin.site.urls),
    *api_url_patterns,
    path("", include("social_django.urls", namespace="social")),
    path("logout", auth_views.logout_then_login, name="logout"),
    re_path(r"^api.+", api_not_found),
    re_path(r"^.*", login_required(frontend)),
]
