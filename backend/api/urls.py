from typing import Any, List

from django.urls import path, register_converter

from backend.api import converters

from .views import CityViewSet, MatchViewSet, TripViewSet, UserViewSet

register_converter(converters.TransactionalIDConverter, "id")

urlpatterns: List[Any] = [
    path("api/cities", CityViewSet.as_view({"get": "list"}), name="cities"),
    path(
        "api/users/me",
        UserViewSet.as_view({"get": "retrieve", "patch": "partial_update"}),
        name="users_me",
        kwargs={"me": True},
    ),
    path(
        "api/trips",
        TripViewSet.as_view({"get": "list", "post": "create"}),
        name="trips",
    ),
    path(
        "api/trips/<id:transactional_id>",
        TripViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
        name="trip",
    ),
    path(
        "api/matches",
        MatchViewSet.as_view({"get": "list"}),
        name="matches",
    ),
    path(
        "api/matches/<id:transactional_id>",
        MatchViewSet.as_view({"get": "retrieve"}),
        name="match",
    ),
]
