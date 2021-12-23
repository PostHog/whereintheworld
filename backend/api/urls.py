from typing import Any, List

from django.urls import path

from .views import CityViewSet

urlpatterns: List[Any] = [
    path("api/cities", CityViewSet.as_view({"get": "list"})),
]
