from typing import Tuple

from cities.models import City, Country
from rest_framework import serializers


class ReadOnlySerializer(serializers.ModelSerializer):
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


class CitySerializer(ReadOnlySerializer):

    name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    country = CountrySerializer(many=False, read_only=True)

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            "country",
            "location",
            "kind",
            "timezone",
        )

    def get_name(self, instance: City) -> str:
        return instance.name_std

    def get_location(self, instance: City) -> Tuple[float, float]:
        return instance.location.coords
