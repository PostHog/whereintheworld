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
        "state",
        "are_meeting",
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

    # Listing / retrieving matches

    def test_can_list_and_retrieve_your_matches(self):
        match1 = Match.objects.first()
        match1.target_state = "seen"
        match1.save()

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
        self.assertEqual(json_response["results"][0]["state"], "seen")

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

    # Updating matches

    def test_user_can_update_match_state(self):
        match = Match.objects.first()

        self.client.force_login(self.user2)
        response = self.client.patch(f"/api/matches/{match.transactional_id}", {"state": "seen", "are_meeting": True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(json_response["state"], "seen")
        self.assertEqual(json_response["are_meeting"], True)

        match.refresh_from_db()
        self.assertEqual(match.target_state, "seen")
        self.assertEqual(match.are_meeting, True)

        # Now test that relevant state is updated if another user updates it
        self.client.force_login(self.user)
        response = self.client.patch(f"/api/matches/{match.transactional_id}", {"state": "dismissed"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        json_response = response.json()
        self.assertEqual(json_response["state"], "dismissed")
        self.assertEqual(json_response["are_meeting"], True)

        match.refresh_from_db()
        self.assertEqual(match.target_state, "seen")
        self.assertEqual(match.source_state, "dismissed")

    def test_cannot_update_match_irrelevant_for_user(self):
        match = Match.objects.first()

        self.client.force_login(self.user3)
        response = self.client.patch(f"/api/matches/{match.transactional_id}", {"state": "seen", "are_meeting": True})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json(), self.permission_denied_response())

        match.refresh_from_db()
        self.assertEqual(match.target_state, "unseen")
        self.assertEqual(match.are_meeting, False)

    def test_cannot_update_match_for_another_team(self):
        another_user_team2 = User.objects.create(
            team=self.team2, email="u2@team2.posthog.com", password=self.CONFIG_PASSWORD
        )
        trip = Trip.objects.create(
            city=self.frankfurt,
            user=another_user_team2,
            start=dt.date(2041, 9, 1),
            end=dt.date(2041, 9, 5),
        )
        match = trip.target_matches.first()

        response = self.client.patch(f"/api/matches/{match.transactional_id}", {"state": "seen", "are_meeting": True})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), self.not_found_response())

        match.refresh_from_db()
        self.assertEqual(match.source_state, "unseen")
        self.assertEqual(match.target_state, "unseen")
        self.assertEqual(match.are_meeting, False)

    def test_cannot_set_invalid_match_state(self):
        match = Match.objects.first()

        response = self.client.patch(f"/api/matches/{match.transactional_id}", {"state": "hello!"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {
                "type": "validation_error",
                "code": "invalid_choice",
                "detail": '"hello!" is not a valid choice.',
                "attr": "state",
            },
        )

        match.refresh_from_db()
        self.assertEqual(match.source_state, "unseen")
