import datetime as dt

from rest_framework import status

from backend.models import Match, Trip, User
from backend.test.base import APIBaseTest


class TestMatches(APIBaseTest):
    SERIALIZER_ATTRIBUTES = [
        "id",
        "source_user",
        "target_user",
        "distance",
        "overlap_start",
        "overlap_end",
        "source_trip",
        "target_trip",
    ]

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user2 = User.objects.create(
            email="u2@posthog.com",
            team=cls.team,
            password=cls.CONFIG_PASSWORD,
            home_city=cls.paris,
        )

        cls.user3 = User.objects.create(
            email="u3@posthog.com",
            team=cls.team,
            password=cls.CONFIG_PASSWORD,
            home_city=cls.paris,
        )

        cls.trip = Trip.objects.create(
            city=cls.paris,
            user=cls.user,
            start=dt.date(2041, 9, 1),
            end=dt.date(2041, 9, 5),
        )

    def test_can_list_and_retrieve_your_matches(self):
        self.client.force_login(self.user2)
        response = self.client.get("/api/matches")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(json_response["count"], 1)
        self.assertEqual(len(json_response["results"][0].keys()), len(self.SERIALIZER_ATTRIBUTES))
        match_id = json_response["results"][0]["id"]
        self.assertRegexpMatches(match_id, r"^match_[A-Za-z0-9]{24}$")
        self.assertEqual(json_response["results"][0]["overlap_start"], "2041-09-01")
        self.assertEqual(json_response["results"][0]["overlap_end"], "2041-09-05")
        self.assertEqual(json_response["results"][0]["distance"], 0)
        self.assertEqual(json_response["results"][0]["source_trip"]["id"], self.trip.transactional_id)
        self.assertEqual(json_response["results"][0]["target_trip"], None)
        self.assertEqual(json_response["results"][0]["source_user"]["first_name"], "Alice")
        self.assertEqual(json_response["results"][0]["target_user"]["email"], "u2@posthog.com")

        # Trip does not repeat user information
        self.assertNotIn("user", json_response["results"][0]["source_trip"])

        # Can retrieve match
        retrieve_response = self.client.get(f"/api/matches/{match_id}")
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)
        self.assertEqual(retrieve_response.json(), json_response["results"][0])

    def test_cannot_list_matches_in_the_past(self):
        """
        TODO: We may want to handle this differently to allow users to see past matches (depending
        on how we use matches later)
        """

        trip = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2011, 9, 1),
            end=dt.date(2011, 9, 5),
        )
        match = Match.objects.filter(source_trip=trip).first()
        response = self.client.get("/api/matches")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()

        for item in json_response["results"]:
            self.assertNotEqual(item["id"], match.transactional_id)

    def test_cannot_retrieve_another_users_matches(self):
        self.client.force_login(self.user2)

        match = Match.objects.get(source_user=self.user, target_user=self.user3)

        response = self.client.get(f"/api/matches/{match.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json(), self.permission_denied_response())

        # Matches for another team are completely isolated
        match = Match.objects.create(
            source_user=self.team2_user,
            target_user=self.team2_user,
            overlap_start=dt.date(2041, 1, 1),
            overlap_end=dt.date(2041, 1, 12),
        )

        response = self.client.get(f"/api/matches/{match.transactional_id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), self.not_found_response())
