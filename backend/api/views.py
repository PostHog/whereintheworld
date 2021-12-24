from typing import ClassVar, Optional

from cities.models import City
from rest_framework import filters, serializers, status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from backend.api.permissions import YourTripsOnlyPermission
from backend.api.serializers import (
    CitySerializer,
    TripCreateSerializer,
    TripSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from backend.models import Trip, User


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
        serializer = self.serializer_class(
            serializer.instance, context={"request": request}
        )
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

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
    Retrieve and update current user.
    """

    serializer_class = UserSerializer
    write_serializer = UserUpdateSerializer

    def get_queryset(self):
        return User.objects.none()

    def get_object(self):
        if self.kwargs.get("me"):
            return self.request.user
        return super().get_object()


class TripViewSet(BaseModelViewSet):
    """
    List, retrieve, create and delete trips.
    """

    serializer_class = TripSerializer
    write_serializer = TripCreateSerializer

    def get_queryset(self):
        me = self.request.query_params.get("me")
        queryset = Trip.objects.filter(user__team=self.request.user.team).order_by(
            "start"
        )

        if me:
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [*super().get_permissions(), YourTripsOnlyPermission()]
        return super().get_permissions()
