from typing import Any, ClassVar, Dict, Optional

from cities.models import City
from django.db import models
from django.utils import timezone
from rest_framework import filters, permissions, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from social_core.pipeline.partial import partial
from social_django.strategy import DjangoStrategy

from backend.api.permissions import YourMatchesOnlyPermission, YourTripsOnlyPermission
from backend.api.serializers import (
    CitySerializer,
    MatchSerializer,
    TripCreateSerializer,
    TripSerializer,
    UserListSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from backend.models import Match, Team, Trip, User


class BaseModelViewSet(ModelViewSet):

    lookup_field = "transactional_id"
    write_serializer: ClassVar[Optional[serializers.Serializer]] = None

    def get_serializer_class(self):
        """
        Use a write-specific serializer if available, otherwise use
        default.
        """
        if self.action in ["create", "update", "partial_update"]:
            return self.write_serializer or self.serializer_class
        return self.serializer_class

    def create(self, request, *args, **kwargs):

        # Default DRF behavior
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Objects are now returned with the list serializer (to return the full object)
        serializer = self.serializer_class(serializer.instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        instance = self.get_object()

        # Objects are now returned with the list serializer (to return the full object)
        serializer = self.serializer_class(instance, context={"request": request})
        return Response(serializer.data)


class CityViewSet(BaseModelViewSet):
    """
    List and retrieve and delete cities.
    """

    serializer_class = CitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name_std"]

    def get_queryset(self):
        return City.objects.order_by("population", "name_std")


class UserViewSet(BaseModelViewSet):
    """
    List users, retrieve and update current user.
    """

    serializer_class = UserSerializer
    write_serializer = UserUpdateSerializer

    def get_queryset(self):
        return User.objects.filter(team=self.request.user.team).order_by("first_name")

    def get_object(self):
        if self.kwargs.get("me"):
            return self.request.user
        return super().get_object()

    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        return super().get_serializer_class()


@partial
def social_create_user(
    strategy: DjangoStrategy, details, backend, request, user=None, *args, **kwargs
) -> Dict[str, Any]:
    if user:
        return {"is_new": False}

    email = details["email"][0] if isinstance(details["email"], (list, tuple)) else details["email"]
    name = (
        details["fullname"]
        or f"{details['first_name'] or ''} {details['last_name'] or ''}".strip()
        or details["username"]
    )
    avatar_url = ""

    try:
        # TODO: Copy avatar & save locally to avoid extra request
        avatar_url = kwargs["response"]["picture"]
    except KeyError:
        pass

    strategy.session_set("user_name", name)
    strategy.session_set("backend", backend.name)

    if not email or not name:
        missing_attr = "email" if not email else "name"
        raise ValidationError(
            {missing_attr: "This field is required and was not provided by the IdP."}, code="required"
        )

    # TODO: whereintheworld is intended for internal use only just yet, multitenancy NOT YET supported
    # team must be assigned based on email's TLD.
    return {
        "is_new": True,
        "user": User.objects.create(email=email, first_name=name, team=Team.objects.first(), avatar_url=avatar_url),
    }


class TripViewSet(BaseModelViewSet):
    """
    List, retrieve, create and delete trips.
    """

    serializer_class = TripSerializer
    write_serializer = TripCreateSerializer

    def get_queryset(self):
        me = self.request.query_params.get("me")
        queryset = Trip.objects.filter(user__team=self.request.user.team).order_by("start")

        if me:
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [*super().get_permissions(), YourTripsOnlyPermission()]
        return super().get_permissions()


class MatchViewSet(BaseModelViewSet):
    """
    List and retrieve matches.
    """

    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated, YourMatchesOnlyPermission]

    def get_queryset(self):
        if self.action == "list":
            return (
                Match.objects.filter(models.Q(source_user=self.request.user) | models.Q(target_user=self.request.user))
                .filter(overlap_end__gte=timezone.now())
                .order_by("overlap_start")
            )

        # When retrieving we can fetch all matches for the user's team so a proper 403
        # response is returned if applicable
        return Match.objects.filter(source_user__team=self.request.user.team).order_by("overlap_start")
