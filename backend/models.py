import datetime as dt

from cities.models import City
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.db import models
from django.db.models import Q
from django_extensions.db.models import TimeStampedModel

from .utils import generate_id


class CoreModel(TimeStampedModel):

    PREFIXER = ""

    transactional_id = models.CharField(
        db_index=True, unique=True, editable=False, max_length=30, default=generate_id
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.pk:
            self.transactional_id = generate_id(self.PREFIXER)
        return super().save(*args, **kwargs)


class Team(CoreModel):
    """
    Company/organization entity to enable multi-tenancy usage.
    """

    PREFIXER = "team"
    name = models.CharField(max_length=64)


class User(CoreModel, AbstractUser):
    PREFIXER = "user"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="users")
    avatar_url = models.CharField(max_length=512, blank=True)
    home_city = models.ForeignKey(
        City, on_delete=models.deletion.CASCADE, null=True, blank=True
    )

    # AbstractUser overrides
    username = None  # type: ignore
    groups = None  # type: ignore
    user_permissions = None  # type: ignore
    email = models.EmailField(unique=True)

    class Meta:
        swappable = "AUTH_USER_MODEL"


class Trip(CoreModel):
    PREFIXER = "trip"

    city = models.ForeignKey(City, on_delete=models.deletion.CASCADE)
    start = models.DateField()
    end = models.DateField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips",
    )
    notes = models.TextField(blank=True)


class UserLocation(CoreModel):
    """
    Abstraction to represent where a user will be at a given time. Enables faster lookups at runtime.
    """

    PREFIXER = "loc"
    start = models.DateField()
    end = models.DateField(null=True)
    trip = models.OneToOneField(
        Trip,
        on_delete=models.deletion.CASCADE,
        null=True,
        blank=True,
        related_name="location",
    )
    city = models.ForeignKey(City, on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="locations",
    )

    def calculate_matches(self):
        """
        Computes any potential matches with other users at the specified location.
        """
        matching_locations = (
            UserLocation.objects.filter(
                user__team=self.user.team,
                city__location__dwithin=(
                    self.city.location,
                    1.8,
                ),  # 1.8 degrees is approximately 200km
                start__lte=self.end,
                end__gte=self.start,
            )
            .exclude(pk=self.pk)
            .exclude(
                Q(source_matches__in=Match.objects.filter(source_match=self))
                | Q(
                    destination_matches__in=Match.objects.filter(destination_match=self)
                )
            )
            .exclude(user=self.user)  # don't match against yourself
            .annotate(distance=Distance("city__location", self.city.location))
            .order_by("pk")
        )

        insert_statements = []

        for match in matching_locations:
            source_match = (
                match if match.pk < self.pk else self
            )  # Ensures deterministic position in either source or destination so unique constraint works
            destination_match = match if match.pk > self.pk else self

            insert_statements.append(
                Match(
                    source_match=source_match,
                    destination_match=destination_match,
                    distance=int(match.distance.m),
                )
            )

        Match.objects.bulk_create(
            insert_statements, ignore_conflicts=True
        )  # If match already exists, ignore


class Match(CoreModel):
    """
    Records matches between users being close to each other at a given time.
    """

    source_match = models.ForeignKey(
        UserLocation, on_delete=models.deletion.CASCADE, related_name="source_matches"
    )
    destination_match = models.ForeignKey(
        UserLocation,
        on_delete=models.deletion.CASCADE,
        related_name="destination_matches",
    )
    distance = models.IntegerField(blank=True, null=True, default=None)

    class Meta:
        unique_together = (
            "source_match",
            "destination_match",
        )


def calculate_locations_for_user(user: User) -> None:
    """
    Computes the location of where a user will be based on their trips.
    """
    trips = Trip.objects.filter(user=user).order_by("start")

    # # Inception location
    # inception, created = UserLocation.objects.get_or_create(
    #     user=user,
    #     start=dt.date(1970, 1, 1),
    #     city=user.home_city,
    #     end=(None if len(trips) == 0 else trips.first().start),
    # )

    # if created:
    #     # Only one inception per user
    #     UserLocation.objects.filter(user=user, start=dt.datetime(1970, 1, 1)).exclude(
    #         pk=inception.pk
    #     ).delete()

    for trip in trips:
        UserLocation.objects.get_or_create(
            start=trip.start, end=trip.end, trip=trip, city=trip.city, user=user
        )
