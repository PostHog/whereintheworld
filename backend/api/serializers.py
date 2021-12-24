from typing import Tuple

from cities.models import City, Country, Region
from rest_framework import serializers

from backend.models import User


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


class UserSerializer(BaseSerializer):
    home_city = CitySerializer(many=False)

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
