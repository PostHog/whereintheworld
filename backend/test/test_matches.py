import datetime as dt

from backend.models import Match, User, UserLocation
from backend.test.base import BaseTest


class TestMatches(BaseTest):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user2 = User.objects.create(
            email="u2@posthog.com", team=cls.team, password=cls.CONFIG_PASSWORD
        )
        cls.user3 = User.objects.create(
            email="u3@posthog.com", team=cls.team, password=cls.CONFIG_PASSWORD
        )
        cls.user4 = User.objects.create(
            email="u4@posthog.com", team=cls.team, password=cls.CONFIG_PASSWORD
        )

    def test_calculate_matches_base(self):

        loc1 = UserLocation.objects.create(
            city=self.london,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )

        # Matched trip
        loc2 = UserLocation.objects.create(
            city=self.cambridge,
            user=self.user2,
            start=dt.date(2021, 9, 3),
            end=dt.date(2021, 9, 8),
        )

        # Doesn't match location
        UserLocation.objects.create(
            city=self.paris,
            user=self.user3,
            start=dt.date(2021, 9, 2),
            end=dt.date(2021, 9, 8),
        )

        # Doesn't match date
        UserLocation.objects.create(
            city=self.cambridge,
            user=self.user4,
            start=dt.date(2021, 8, 20),
            end=dt.date(2021, 8, 31),
        )

        # Can't match against yourself
        UserLocation.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 9, 7),
            end=dt.date(2021, 9, 8),
        )

        # Can't match to another team
        UserLocation.objects.create(
            city=self.london,
            user=self.team2_user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )

        matches_count = Match.objects.count()

        loc2.calculate_matches()

        self.assertEqual(Match.objects.count(), matches_count + 1)
        match = Match.objects.last()
        self.assertEqual(
            match.source_match, loc1
        )  # First trip is always the source_match
        self.assertEqual(match.destination_match, loc2)
        self.assertEqual(match.distance, 81702)

    def test_single_day_trip_matches(self):
        loc1 = UserLocation.objects.create(
            city=self.london,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 1),
        )

        loc2 = UserLocation.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 8, 28),
            end=dt.date(2021, 9, 30),
        )

        matches_count = Match.objects.count()
        loc1.calculate_matches()
        self.assertEqual(Match.objects.count(), matches_count + 1)
        match = Match.objects.last()
        self.assertEqual(match.source_match, loc1)
        self.assertEqual(match.destination_match, loc2)
        self.assertEqual(match.distance, 0)

    def test_dont_match_other_teams(self):
        UserLocation.objects.create(
            city=self.london,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )

        loc = UserLocation.objects.create(
            city=self.london,
            user=self.team2_user,
            start=dt.date(2021, 9, 3),
            end=dt.date(2021, 9, 8),
        )

        matches_count = Match.objects.count()
        loc.calculate_matches()
        self.assertEqual(Match.objects.count(), matches_count)

    def test_match_with_inception_and_no_end_date(self):
        # TODO
        pass
