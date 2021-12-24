import datetime as dt

from rest_framework import status

from backend.models import Trip, User
from backend.test.base import APIBaseTest


class TestTrips(APIBaseTest):
    SERIALIZER_ATTRIBUTES = ["id", "city", "start", "end", "user", "notes"]

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user2 = User.objects.create(
            email="u2@posthog.com",
            team=cls.team,
            home_city=cls.paris,
        )
        cls.user3 = User.objects.create(
            email="u3@posthog.com",
            team=cls.team,
            home_city=cls.paris,
        )

        cls.trip1 = Trip.objects.create(
            city=cls.paris,
            user=cls.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )

        cls.trip2 = Trip.objects.create(
            city=cls.london,
            user=cls.user2,
            start=dt.date(2021, 10, 1),
            end=dt.date(2021, 10, 5),
        )

        cls.trip3 = Trip.objects.create(
            city=cls.frankfurt,
            user=cls.user3,
            start=dt.date(2021, 11, 1),
            end=dt.date(2021, 11, 5),
        )

        cls.trip_team_2 = Trip.objects.create(
            city=cls.frankfurt,
            user=cls.team2_user,
            start=dt.date(2021, 11, 1),
            end=dt.date(2021, 11, 5),
        )

    def test_can_list_trips_for_everyone_on_the_team(self):
        response = self.client.get("/api/trips")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(json_response["count"], 3)
        self.assertEqual(
            len(json_response["results"][0].keys()), len(self.SERIALIZER_ATTRIBUTES)
        )
        self.assertEqual(json_response["results"][0]["user"]["first_name"], "Alice")
        self.assertEqual(json_response["results"][0]["city"]["name"], "Paris")
        self.assertEqual(json_response["results"][0]["start"], "2021-09-01")
        self.assertEqual(json_response["results"][0]["end"], "2021-09-05")

    def test_can_list_your_own_trips(self):
        response = self.client.get("/api/trips?me=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()

        self.assertEqual(json_response["count"], 1)
        self.assertEqual(
            len(json_response["results"][0].keys()), len(self.SERIALIZER_ATTRIBUTES)
        )
        self.assertEqual(json_response["results"][0]["user"]["first_name"], "Alice")

    def test_can_retrieve_trip(self):
        for trip in [self.trip1, self.trip2]:
            response = self.client.get(f"/api/trips/{trip.transactional_id}")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            json_response = response.json()
            self.assertEqual(len(json_response.keys()), len(self.SERIALIZER_ATTRIBUTES))
            self.assertEqual(json_response["user"]["first_name"], trip.user.first_name)
            self.assertEqual(json_response["city"]["name"], trip.city.name_std)
            self.assertEqual(json_response["start"], trip.start.strftime("%Y-%m-%d"))
            self.assertEqual(json_response["end"], trip.end.strftime("%Y-%m-%d"))

    def test_cannot_see_trips_for_another_team(self):
        response = self.client.get(f"/api/trips/{self.trip_team_2.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), self.not_found_response())

    def test_can_create_trip(self):
        count = Trip.objects.count()
        response = self.client.post(
            "/api/trips",
            {
                "city": int(self.paris.pk),
                "start": "2021-12-15",
                "end": "2021-12-18",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        json_response = response.json()
        self.assertEqual(json_response["user"]["first_name"], "Alice")
        self.assertEqual(json_response["city"]["name"], "Paris")

        self.assertEqual(Trip.objects.count(), count + 1)
        trip = Trip.objects.last()
        self.assertEqual(trip.user, self.user)
        self.assertEqual(trip.city, self.paris)
        self.assertEqual(trip.start, dt.date(2021, 12, 15))
        self.assertEqual(trip.end, dt.date(2021, 12, 18))

    def test_cannot_create_trip_without_required_attributes(self):
        count = Trip.objects.count()

        # Test for base parameters
        required_fields = ["city", "start", "end"]

        for required_field in required_fields:
            body = {
                "city": int(self.paris.pk),
                "start": "2021-12-15",
                "end": "2021-12-18",
            }
            body.pop(required_field)
            response = self.client.post(
                "/api/trips",
                body,
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(
                response.json(),
                {
                    "type": "validation_error",
                    "code": "required",
                    "detail": "This field is required.",
                    "attr": required_field,
                },
            )

        self.assertEqual(Trip.objects.count(), count)

    def test_cannot_create_trip_with_invalid_date_range(self):
        count = Trip.objects.count()
        response = self.client.post(
            "/api/trips",
            {
                "city": int(self.paris.pk),
                "start": "2021-12-18",
                "end": "2021-12-17",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {
                "type": "validation_error",
                "code": "invalid_date_range",
                "detail": "Must be before start.",
                "attr": "end",
            },
        )
        self.assertEqual(Trip.objects.count(), count)

    def test_can_delete_trip(self):
        response = self.client.delete(f"/api/trips/{self.trip1.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.content.decode(), "")

        self.assertFalse(Trip.objects.filter(pk=self.trip1.pk).exists())

    def test_cannot_delete_someone_elses_trip(self):
        # Trip from another teammate
        response = self.client.delete(f"/api/trips/{self.trip2.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.json(),
            self.permission_denied_response(
                "You cannot modify or delete someone else's trip."
            ),
        )
        self.trip2.refresh_from_db()

        # Trip from another team
        response = self.client.delete(f"/api/trips/{self.trip_team_2.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), self.not_found_response())
        self.trip_team_2.refresh_from_db()
