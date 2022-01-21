from typing import Optional, Tuple

from cities.models import City, Country, Region
from rest_framework import exceptions, serializers
from rest_framework.fields import empty

from backend.models import Match, Trip, User
from backend.usage import report_object_created


class BaseSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        """
        Defaults to the friendlier `transactional_id` (if available).
        Third-party models (e.g. Cities) do not contain such ID.
        """
        return obj.transactional_id if hasattr(obj, "transactional_id") else obj.id

    def create(self, validated_data):
        instance = super().create(validated_data)
        if "request" in self.context:
            report_object_created(self.context["request"].user, instance)
        return instance


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
        fields = ("id", "first_name", "avatar_url", "home_city", "email", "work_hours")


class UserUpdateSerializer(BaseSerializer):
    home_city = serializers.SlugRelatedField(slug_field="id", queryset=City.objects.all())

    class Meta:
        model = User
        fields = (
            "first_name",
            "avatar_url",
            "home_city",
            "work_hours",
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

    def __init__(self, instance=None, data=empty, **kwargs):
        simple = kwargs.pop("simple", False)
        super().__init__(instance=instance, data=data, **kwargs)
        if simple:
            self.fields.pop("user")
            self.fields.pop("notes")


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
        assert "request" in self.context, "`request` must be passed in context"
        attrs["user"] = self.context["request"].user

        if attrs["start"] > attrs["end"]:
            raise serializers.ValidationError({"end": "Must be before start."}, code="invalid_date_range")

        if Trip.objects.filter(user=attrs["user"]).filter(start__lt=attrs["end"], end__gt=attrs["start"]).exists():
            raise serializers.ValidationError({"end": "You cannot add an overlapping trip."}, code="overlapping_trip")
        return attrs


class UserListSerializer(UserSerializer):
    trips = TripSerializer(many=True, read_only=True, simple=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "avatar_url",
            "home_city",
            "email",
            "work_hours",
            "trips",
        )


class MatchSerializer(ReadOnlySerializer):
    source_user = UserSerializer(many=False, read_only=True)
    target_user = UserSerializer(many=False, read_only=True)
    source_trip = TripSerializer(many=False, read_only=True, simple=True)
    target_trip = TripSerializer(many=False, read_only=True, simple=True)
    state = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = (
            "id",
            "source_user",
            "target_user",
            "distance",
            "overlap_start",
            "overlap_end",
            "source_trip",
            "target_trip",
            "state",
            "are_meeting",
        )

    def get_state(self, instance) -> Optional[str]:
        if "request" not in self.context:
            return None
        if self.context["request"].user == instance.source_user:
            return instance.source_state
        elif self.context["request"].user == instance.target_user:
            return instance.target_state
        return None


class MatchUpdateSerializer(serializers.ModelSerializer):
    state = serializers.ChoiceField(Match.STATE_CHOICES, write_only=True)

    class Meta:
        model = Match
        fields = (
            "state",
            "are_meeting",
        )

    def update(self, instance, validated_data):
        assert "request" in self.context, "`request` must be passed to this serializer."
        state = validated_data.pop("state", None)
        if state:
            if self.context["request"].user == instance.source_user:
                validated_data["source_state"] = state
            elif self.context["request"].user == instance.target_user:
                validated_data["target_state"] = state
            else:
                raise exceptions.PermissionDenied()
        return super().update(instance, validated_data)
