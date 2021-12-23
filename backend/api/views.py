from cities.models import City
from rest_framework import filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from backend.api.serializers import CitySerializer


class BaseModelViewSet(ModelViewSet):

    permission_classes = (IsAuthenticated,)
    lookup_field = "transactional_id"
    write_serializer = None

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


class CityViewSet(ModelViewSet):
    """
    List and retrieve and delete cities.
    """

    serializer_class = CitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name_std"]

    def get_queryset(self):
        return City.objects.order_by("population", "name_std")
