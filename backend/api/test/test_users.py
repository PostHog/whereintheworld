import datetime as dt

from rest_framework import status

from backend.models import Match, Trip, User
from backend.test.base import APIBaseTest


class TestUsers(APIBaseTest):
    SERIALIZER_ATTRIBUTES = ["id", "first_name", "avatar_url", "home_city", "email"]

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user.home_city = cls.paris
        cls.user.save()

    def test_user_can_retrieve_themselves(self):

        response = self.client.get("/api/users/me")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(len(json_response.keys()), len(self.SERIALIZER_ATTRIBUTES))
        self.assertEqual(json_response["first_name"], "Alice")
        self.assertEqual(json_response["email"], self.CONFIG_EMAIL)
        self.assertEqual(json_response["home_city"]["name"], "Paris")
        self.assertEqual(json_response["home_city"]["country"]["code"], "FR")

    def test_listing_users_not_implemented(self):
        response = self.client.get("/api/users")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), self.not_found_response())

    def test_cant_see_users_if_unauthenticated(self):
        self.client.logout()
        response = self.client.get("/api/users/me")
        # TODO: Will be fixed when using real auth (401)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json(), self.unauthenticated_response())

    def test_can_update_home_location(self):
        new_user = User.objects.create(
            email="u4@posthog.com",
            team=self.team,
            password=self.CONFIG_PASSWORD,
        )
        Trip.objects.create(
            city=self.paris,
            user=new_user,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )
        self.assertEqual(Match.objects.count(), 1)

        response = self.client.patch(
            "/api/users/me",
            {
                "home_city": int(self.frankfurt.id),
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(len(json_response.keys()), len(self.SERIALIZER_ATTRIBUTES))
        self.assertEqual(json_response["home_city"]["name"], "Frankfurt")
        self.assertEqual(
            json_response["home_city"]["location"], [50.5069755, 6.3286251]
        )

        self.user.refresh_from_db()
        self.assertEqual(self.user.home_city, self.frankfurt)

        # Ensure previous match is cleared
        self.assertEqual(Match.objects.count(), 0)

    def test_can_update_avatar_url_and_name(self):
        """
        Also tests that other attributes cannot be updated.
        """
        response = self.client.patch(
            "/api/users/me",
            {
                "avatar_url": "https://posthog.com/static/3953b41e0e79b4c1949ca8399ab5b8d0/02b31/max-hedgehog.webp",
                "email": "my_new_email@posthog.com",
                "first_name": "Alice B.",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(len(json_response.keys()), len(self.SERIALIZER_ATTRIBUTES))
        self.assertEqual(json_response["first_name"], "Alice B.")
        self.assertEqual(json_response["email"], self.CONFIG_EMAIL)
        self.assertEqual(
            json_response["avatar_url"],
            "https://posthog.com/static/3953b41e0e79b4c1949ca8399ab5b8d0/02b31/max-hedgehog.webp",
        )
        self.assertEqual(
            json_response["home_city"]["name"], "Paris"
        )  # to ensure the full serialized object is returned

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Alice B.")
        self.assertEqual(self.user.email, self.CONFIG_EMAIL)
