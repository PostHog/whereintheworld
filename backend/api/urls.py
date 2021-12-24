from typing import Any, List

from django.urls import path

from .views import CityViewSet, UserViewSet

urlpatterns: List[Any] = [
    path("api/cities", CityViewSet.as_view({"get": "list"}), name="cities"),
    path(
        "api/users/me",
        UserViewSet.as_view({"get": "retrieve", "patch": "partial_update"}),
        name="users_me",
        kwargs={"me": True},
    ),
]
