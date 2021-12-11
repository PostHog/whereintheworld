import datetime as dt
from typing import Any, Dict, List

from backend.models import Trip, User, UserLocation, calculate_locations_for_user
from backend.test.base import BaseTest


class TestUserLocations(BaseTest):
    def helper_validate_locations_for_user(self, user: User, locations: List[Dict[str, Any]]) -> None:
        for location in locations:
            self.assertTrue(UserLocation.objects.filter(user=user, **location).exists())

    def helper_assert_only_one_inception_omega_location(self, user: User) -> None:
        self.assertEqual(UserLocation.objects.filter(user=self.user, start=dt.date(1970, 1, 1)).count(), 1)
        self.assertEqual(UserLocation.objects.filter(user=self.user, end=None).count(), 1)

    def test_inception_location_is_created_when_setting_home_location(self):
        self.user.home_city = self.london
        calculate_locations_for_user(self.user)

        self.assertTrue(
            UserLocation.objects.filter(user=self.user, city=self.london, start=dt.date(1970, 1, 1), end=None).exists()
        )

        self.helper_assert_only_one_inception_omega_location(self.user)

    def test_locations_are_updated_when_a_trip_is_created(self):
        self.user.home_city = self.london
        self.user.save()
        trip = Trip.objects.create(
            city=self.paris, start=dt.date(2021, 12, 1), end=dt.date(2021, 12, 5), user=self.user
        )

        # calculate_locations_for_user runs automatically
        self.helper_validate_locations_for_user(
            self.user,
            [
                {"city": self.london, "start": dt.date(1970, 1, 1), "end": dt.date(2021, 12, 1)},
                {"city": self.paris, "start": dt.date(2021, 12, 1), "end": dt.date(2021, 12, 5), "trip": trip},
                {"city": self.london, "start": dt.date(2021, 12, 5), "end": None},
            ],
        )

        self.helper_assert_only_one_inception_omega_location(self.user)

    def test_creating_multiple_trips_sets_location_correctly(self):
        self.user.home_city = self.paris
        self.user.save()
        trip1 = Trip.objects.create(
            city=self.london, start=dt.date(2021, 4, 1), end=dt.date(2021, 4, 5), user=self.user
        )
        trip2 = Trip.objects.create(
            city=self.edinburgh, start=dt.date(2021, 4, 7), end=dt.date(2021, 4, 7), user=self.user
        )
        trip3 = Trip.objects.create(
            city=self.cambridge, start=dt.date(2021, 5, 8), end=dt.date(2021, 5, 10), user=self.user
        )
        trip4 = Trip.objects.create(
            city=self.edinburgh, start=dt.date(2021, 6, 17), end=dt.date(2021, 6, 28), user=self.user
        )
        trip5 = Trip.objects.create(
            city=self.london, start=dt.date(2021, 4, 10), end=dt.date(2021, 4, 21), user=self.user
        )  # in the middle of the other trips

        print("----------> BEGIN ------>")
        calculate_locations_for_user(self.user)
        print(UserLocation.objects.order_by("start"))
        # calculate_locations_for_user runs automatically
        self.helper_validate_locations_for_user(
            self.user,
            [
                {"city": self.paris, "start": dt.date(1970, 1, 1), "end": dt.date(2021, 4, 1)},
                {"city": self.london, "start": dt.date(2021, 4, 1), "end": dt.date(2021, 4, 5), "trip": trip1},
                {"city": self.paris, "start": dt.date(2021, 4, 5), "end": dt.date(2021, 4, 7)},
                {"city": self.edinburgh, "start": dt.date(2021, 4, 7), "end": dt.date(2021, 4, 7), "trip": trip2},
                {"city": self.paris, "start": dt.date(2021, 4, 7), "end": dt.date(2021, 4, 10)},
                {"city": self.london, "start": dt.date(2021, 4, 10), "end": dt.date(2021, 4, 21), "trip": trip5},
                {"city": self.paris, "start": dt.date(2021, 4, 21), "end": dt.date(2021, 5, 8)},
                {"city": self.edinburgh, "start": dt.date(2021, 5, 8), "end": dt.date(2021, 5, 10), "trip": trip3},
                {"city": self.paris, "start": dt.date(2021, 5, 10), "end": dt.date(2021, 6, 17)},
                {"city": self.edinburgh, "start": dt.date(2021, 6, 17), "end": dt.date(2021, 6, 28), "trip": trip4},
                {"city": self.london, "start": dt.date(2021, 6, 28), "end": None},
            ],
        )

    def test_locations_are_updated_when_a_trip_is_deleted(self):
        pass

    def test_locations_are_updated_when_home_town_is_updated(self):
        self.user.home_city = self.london
        self.user.save()
        trip = Trip.objects.create(
            city=self.london, start=dt.date(2021, 12, 20), end=dt.date(2021, 12, 30), user=self.user
        )
        self.user.home_city = self.edinburgh
        self.user.save()

        calculate_locations_for_user(self.user)

        self.helper_validate_locations_for_user(
            self.user,
            [
                {"city": self.edinburgh, "start": dt.date(1970, 1, 1), "end": dt.date(2021, 12, 20)},
                {"city": self.london, "start": dt.date(2021, 12, 20), "end": dt.date(2021, 12, 30), "trip": trip},
                {"city": self.edinburgh, "start": dt.date(2021, 12, 30), "end": None},
            ],
        )

        self.helper_assert_only_one_inception_omega_location(self.user)
