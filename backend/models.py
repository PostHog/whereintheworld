from cities.models import City
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django_extensions.db.models import TimeStampedModel

from .utils import generate_id


class CoreModel(TimeStampedModel):

    PREFIXER = ""
    IMMUTABLE_FIELDS = []

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
    username = None  # type: ignore
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    avatar_url = models.CharField(max_length=512, blank=True)
    home_city = models.ForeignKey(City, on_delete=models.deletion.CASCADE)


class Trip(CoreModel):
    PREFIXER = "trip"

    city = models.ForeignKey(City, on_delete=models.deletion.CASCADE)
    start = models.DateField()
    end = models.DateField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    notes = models.TextField(blank=True)


class Location(CoreModel):
    """
    Abstraction to represent where a user will be at a given time. Enables faster lookups at runtime.
    """

    PREFIXER = "loc"
    start = models.DateField()
    end = models.DateField(null=True)
    trip = models.ForeignKey(
        Trip, on_delete=models.deletion.CASCADE, null=True, blank=True
    )
    city = models.ForeignKey(City, on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
