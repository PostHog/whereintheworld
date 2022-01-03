import datetime as dt

from cities.models import City
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from backend.models import Team, Trip, User


class Command(BaseCommand):
    help = "Set up the instance for development/review with demo data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-data",
            action="store_true",
            help="Create demo accounts without data",
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            london = City.objects.get(name_std="London", country__code="GB")
            paris = City.objects.get(name_std="Paris", country__code="FR")
            cambridge = City.objects.get(name_std="Cambridge", country__code="GB")
            rome = City.objects.get(name_std="Rome", country__code="IT")

            team = Team.objects.create(name="Hogflix") if not Team.objects.exists() else Team.objects.first()
            user = User.objects.create(
                email="test@posthog.com",
                password="12345678",
                first_name="Alice",
                team=team,
                is_staff=True,
                home_city=london,
            )

            user2 = User.objects.create(
                email="test2@posthog.com",
                password="12345678",
                first_name="Bob",
                team=team,
                home_city=paris,
            )

            if not options["no_data"]:
                Trip.objects.create(
                    city=paris,
                    user=user,
                    start=timezone.now() + dt.timedelta(days=1),
                    end=timezone.now() + dt.timedelta(days=5),
                )

                user3 = User.objects.create(
                    email="test4@posthog.com",
                    password="12345678",
                    first_name="Charlie",
                    team=team,
                    home_city=paris,
                )

                Trip.objects.create(
                    city=cambridge,
                    user=user3,
                    start=timezone.now() + dt.timedelta(days=4),
                    end=timezone.now() + dt.timedelta(days=8),
                )

                Trip.objects.create(
                    city=rome,
                    user=user2,
                    start=timezone.now() + dt.timedelta(days=3),
                    end=timezone.now() + dt.timedelta(days=10),
                )
