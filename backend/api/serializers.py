from typing import Tuple

from cities.models import City, Country, Region
from rest_framework import serializers

from backend.models import Trip, User


class BaseSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        """
        Defaults to the friendlier `transactional_id` (if available).
        Third-party models (e.g. Cities) do not contain such ID.
        """
        return obj.transactional_id if hasattr(obj, "transactional_id") else obj.id


class ReadOnlySerializer(BaseSerializer):
    def create(self, validated_data):
        raise NotImplementedError()

    def update(self, instance, validated_data):
        raise NotImplementedError()


class CountrySerializer(ReadOnlySerializer):
    class Meta:
        model = Country
        fields = (
            "code",
            "code3",
            "name",
            "currency",
            "tld",
            "capital",
        )


class RegionSerializer(ReadOnlySerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = (
            "code",
            "name",
        )

    def get_name(self, instance: Region) -> str:
        return instance.name_std or instance.name


class CitySerializer(ReadOnlySerializer):

    name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    country = CountrySerializer(many=False, read_only=True)
    region = RegionSerializer(many=False, read_only=True)

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            "country",
            "region",
            "location",
            "kind",
            "timezone",
        )

    def get_name(self, instance: City) -> str:
        return instance.name_std or instance.name

    def get_location(self, instance: City) -> Tuple[float, float]:
        return instance.location.coords


class UserSerializer(ReadOnlySerializer):
    home_city = CitySerializer(many=False, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "avatar_url",
            "home_city",
            "email",
        )


class UserUpdateSerializer(BaseSerializer):
    home_city = serializers.SlugRelatedField(
        slug_field="id", queryset=City.objects.all()
    )

    class Meta:
        model = User
        fields = (
            "first_name",
            "avatar_url",
            "home_city",
        )


class TripSerializer(ReadOnlySerializer):
    city = CitySerializer(many=False, read_only=True)
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Trip
        fields = (
            "id",
            "city",
            "start",
            "end",
            "user",
            "notes",  # TODO: only available for your trips
        )


class TripCreateSerializer(BaseSerializer):
    city = serializers.SlugRelatedField(slug_field="id", queryset=City.objects.all())

    class Meta:
        model = Trip
        fields = (
            "city",
            "start",
            "end",
            "notes",
        )

    def validate(self, attrs):
        if attrs["start"] > attrs["end"]:
            raise serializers.ValidationError(
                {"end": "Must be before start."}, code="invalid_date_range"
            )
        return attrs

    def create(self, validated_data):
        assert "request" in self.context, "`request` must be passed in context"
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
