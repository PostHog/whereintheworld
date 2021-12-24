import datetime as dt

from django.core.exceptions import ValidationError

from backend.models import Trip
from backend.test.base import BaseTest


class TestTrips(BaseTest):
    def test_trip_start_must_always_be_before_end(self):

        with self.assertRaises(ValidationError) as e:
            Trip.objects.create(
                user=self.user,
                start=dt.date(2020, 4, 28),
                end=dt.date(2020, 4, 27),
                city=self.paris,
            )
        self.assertEqual(e.exception.message_dict, {"end": ["Must be before start."]})

    def test_one_day_trips_are_allowed(self):
        count = Trip.objects.count()
        Trip.objects.create(
            user=self.user,
            start=dt.date(2020, 2, 27),
            end=dt.date(2020, 2, 27),
            city=self.london,
        )
        self.assertEqual(Trip.objects.count(), count + 1)
