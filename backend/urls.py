"""whereintheworld URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path

from .api.urls import urlpatterns as api_url_patterns

urlpatterns = [
    path("admin/", admin.site.urls),
    *api_url_patterns,
]
