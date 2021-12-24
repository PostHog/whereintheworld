import datetime as dt
from typing import List

from cities.models import City
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db.models.functions import Distance
from django.core.exceptions import ValidationError
from django.db import models
from django_extensions.db.models import TimeStampedModel

from .utils import generate_id

LARGE_DATE = dt.date(2500, 1, 1)


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
    REQUIRED_FIELDS: List[str] = []
    _home_city_changed = False

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

    def handle_home_city_change(self):

        # First remove previous matches to your home city.
        Match.objects.filter(
            models.Q(source_user=self, source_trip=None)
            | models.Q(target_user=self, target_trip=None)
        ).delete()

        # Check for trip matches in new location
        # TODO: This could be optimized so we don't check every potential trip match
        potential_trip_matches = Trip.objects.filter(
            city__location__dwithin=(
                self.home_city.location,
                settings.DISTANCE_THRESHOLD,
            )
        )

        for trip in potential_trip_matches:
            trip.compute_matches()


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

    def clean(self) -> None:
        super().clean()

        if self.start > self.end:
            raise ValidationError({"end": "Must be before start."})

    def compute_matches(self):

        insert_statements = []

        # Delete previous matches to your home city in the range of this trip (given you're no longer in your home city)
        stale_matches = Match.objects.filter(
            models.Q(source_user=self.user, source_trip=None)
            | models.Q(target_user=self.user, target_trip=None)
        ).exclude(
            models.Q(overlap_end__lte=self.start)
            | models.Q(overlap_start__gte=self.end)
        )
        trips_to_reprocess = [
            (match.source_trip, match.target_trip) for match in stale_matches
        ]
        stale_matches.delete()

        # Match trips with other users
        trip_matches = (
            Trip.objects.filter(
                user__team=self.user.team,
                city__location__dwithin=(
                    self.city.location,
                    settings.DISTANCE_THRESHOLD,
                ),
                end__gte=self.start,
                start__lte=self.end,
            )
            .exclude(user=self.user)  # don't match against yourself
            .annotate(distance=Distance("city__location", self.city.location))
            .order_by("pk")
        )

        for match in trip_matches:
            source_trip = (
                match if match.user.pk < self.user.pk else self
            )  # Ensures deterministic position in either source or target so unique constraint works
            target_trip = match if match.user.pk > self.user.pk else self

            insert_statements.append(
                Match(
                    source_user=source_trip.user,
                    target_user=target_trip.user,
                    source_trip=source_trip,
                    target_trip=target_trip,
                    distance=int(match.distance.m),
                    overlap_start=max(source_trip.start, target_trip.start),
                    overlap_end=min(source_trip.end, target_trip.end),
                )
            )

        # Match home location with other users
        home_city_matches = (
            User.objects.filter(
                team=self.user.team,
                home_city__location__dwithin=(
                    self.city.location,
                    settings.DISTANCE_THRESHOLD,
                ),
            )
            .exclude(
                pk__in=Trip.objects.filter(
                    start__lte=self.start, end__gte=self.end
                ).values_list("user_id", flat=True)
            )  # exclude if user will be away from home location for the entirety of the trip time
            .exclude(pk=self.user.pk)  # don't match against yourself
            .annotate(distance=Distance("home_city__location", self.city.location))
            .order_by("pk")
        )

        for user in home_city_matches:
            source_user = user if user.pk < self.user.pk else self.user
            target_user = user if user.pk > self.user.pk else self.user
            trip_qs = (
                {"source_trip": self}
                if source_user == self.user
                else {"target_trip": self}
            )
            match_atts = {
                "source_user": source_user,
                "target_user": target_user,
                "distance": int(user.distance.m),
                **trip_qs,
            }

            if not Match.objects.filter(
                source_user=source_user, target_user=target_user, **trip_qs
            ).exists():
                overlap_start = self.start
                overlap_end = self.end

                # User has an overlapping trip in the middle of this match
                overlapping_trips = (
                    Trip.objects.filter(user=user)
                    .filter(start__lte=self.end, end__gte=self.start)
                    .order_by("start")
                )
                if overlapping_trips.exists():
                    # TODO: Extra extra edge case, you could have multiple overlapping trips
                    overlapping_trip = overlapping_trips.first()

                    if overlapping_trip.start < self.start:
                        overlap_start = overlapping_trip.end

                    overlap_end = min(self.end, overlapping_trip.start)

                if overlap_end >= overlap_start:
                    insert_statements.append(
                        Match(
                            **match_atts,
                            overlap_start=overlap_start,
                            overlap_end=overlap_end,
                        )
                    )

                if overlap_end < self.end:
                    # If trip still continues but the previous overlap doesn't cover the entire gap, there's still
                    # another date match
                    insert_statements.append(
                        Match(
                            **match_atts,
                            overlap_start=overlapping_trip.end,
                            overlap_end=self.end,
                        )
                    )

        Match.objects.bulk_create(
            insert_statements, ignore_conflicts=True
        )  # If match already exists, ignore

        # Recompute trip matches for stale matches that were deleted
        for trip1, trip2 in trips_to_reprocess:
            if trip1:
                trip1.compute_matches()

            if trip2:
                trip2.compute_matches()


class Match(CoreModel):
    """
    Records matches between users being close to each other at a given time.
    """

    source_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="source_matches",
    )  # user 1 for this match; source_user is always the user with lower `pk`
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="target_matches",
    )
    distance = models.IntegerField(blank=True, null=True, default=None)
    overlap_start = models.DateField()
    overlap_end = models.DateField(null=True, blank=True)
    source_trip = models.ForeignKey(
        Trip,
        on_delete=models.deletion.CASCADE,
        null=True,
        blank=True,
        related_name="source_matches",
    )  # trip for the source_user that makes up this match (if `None`, `source_user` is at home location)
    target_trip = models.ForeignKey(
        Trip,
        on_delete=models.deletion.CASCADE,
        null=True,
        blank=True,
        related_name="target_matches",
    )  # trip for the target_user that makes up this match (if `None`, `target_user` is at home location)

    class Meta:
        unique_together = (
            "source_trip",
            "target_trip",
        )

    def __str__(self):
        return f"Match for: {self.source_user} and {self.target_user} from {self.overlap_start} to {self.overlap_end}"

    def clean(self) -> None:
        super().clean()

        if self.overlap_end and self.overlap_start > self.overlap_end:
            raise ValidationError({"overlap_end": "Must be before overlap_start."})
