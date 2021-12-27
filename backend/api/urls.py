from typing import Any, List

from django.conf.urls import url
from django.urls import path, register_converter
from rest_framework_jwt.blacklist.views import BlacklistView
from rest_framework_jwt.views import obtain_jwt_token, verify_jwt_token

from backend.api import converters

from .views import CityViewSet, JWTIssueView, MatchViewSet, TripViewSet, UserViewSet

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
    # JWT routes
    path("api/jwt/issue", JWTIssueView.as_view(), name="jwt_generate"),
    url(r"^api/jwt$", obtain_jwt_token, name="auth_login"),
    url(r"^api/jwt/verify$", verify_jwt_token, name="auth_verify"),
    path(
        "api/jwt/logout",
        view=BlacklistView.as_view({"post": "create"}),
        name="auth_logout",
    ),
]
