import datetime as dt

from backend.models import Match, Trip, User
from backend.test.base import BaseTest


class TestMatches(BaseTest):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user2 = User.objects.create(
            email="u2@posthog.com", team=cls.team, password=cls.CONFIG_PASSWORD, home_city=cls.paris
        )
        cls.user3 = User.objects.create(
            email="u3@posthog.com", team=cls.team, password=cls.CONFIG_PASSWORD, home_city=cls.paris
        )
        cls.user4 = User.objects.create(
            email="u4@posthog.com",
            team=cls.team,
            password=cls.CONFIG_PASSWORD,
            home_city=cls.edinburgh,
        )

    def test_basic_trip_match_to_home_location(self):
        trip = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )

        self.assertEqual(Match.objects.count(), 2)
        for i, match in enumerate(Match.objects.all()):
            target_user = self.user2 if i == 0 else self.user3
            self.assertEqual(match.source_user, self.user)
            self.assertEqual(match.target_user, target_user)
            self.assertEqual(match.source_trip, trip)  # Trip for first user is always the source_match
            self.assertEqual(match.target_trip, None)
            self.assertEqual(match.overlap_start, dt.date(2021, 9, 1))
            self.assertEqual(match.overlap_end, dt.date(2021, 9, 5))
            self.assertEqual(match.distance, 0)  # same city

    def test_basic_match_overlapping_trips(self):
        self.user.home_city = self.london
        self.user.save()

        trip2 = Trip.objects.create(
            city=self.london,
            user=self.user3,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )

        trip1 = Trip.objects.create(
            city=self.cambridge,
            user=self.user2,
            start=dt.date(2021, 10, 14),
            end=dt.date(2021, 10, 17),
        )

        self.assertEqual(Match.objects.count(), 3)

        # trip & trip 2 match
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user2,
                target_user=self.user3,
                source_trip=trip1,
                target_trip=trip2,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 17),
                distance=81702,
            ).exists()
        )

        # user2 with user1 (home city)
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                source_trip=None,
                target_trip=trip1,
                overlap_start=dt.date(2021, 10, 14),
                overlap_end=dt.date(2021, 10, 17),
                distance=81702,
            ).exists()
        )

        # user3 with user1 (home city)
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user3,
                source_trip=None,
                target_trip=trip2,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 25),
                distance=0,
            ).exists()
        )

    def test_single_day_trip_matches(self):
        trip = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 1),
        )

        self.assertEqual(Match.objects.count(), 2)
        for match in Match.objects.all():
            self.assertEqual(match.source_user, self.user)
            self.assertIn(match.target_user, [self.user2, self.user3])
            self.assertEqual(match.source_trip, trip)  # Trip for first user is always the source_match
            self.assertEqual(match.target_trip, None)
            self.assertEqual(match.overlap_start, dt.date(2021, 9, 1))
            self.assertEqual(match.overlap_end, dt.date(2021, 9, 1))
            self.assertEqual(match.distance, 0)  # same city

    def test_dont_match_other_teams(self):
        Trip.objects.create(
            city=self.paris,
            user=self.team2_user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 1),
        )

        self.assertEqual(Match.objects.count(), 0)

    def test_deleting_trip_removes_matches(self):
        self.user.home_city = self.london
        self.user.save()

        trip2 = Trip.objects.create(
            city=self.london,
            user=self.user3,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )

        trip1 = Trip.objects.create(
            city=self.cambridge,
            user=self.user2,
            start=dt.date(2021, 10, 14),
            end=dt.date(2021, 10, 17),
        )

        self.assertEqual(Match.objects.count(), 3)

        trip2.delete()
        self.assertEqual(Match.objects.count(), 1)

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                source_trip=None,
                target_trip=trip1,
                overlap_start=dt.date(2021, 10, 14),
                overlap_end=dt.date(2021, 10, 17),
                distance=81702,
            ).exists()
        )

    def test_changing_home_city_removes_matches_and_checks_for_new_matches(self):
        self.user3.home_city = self.london
        self.user3.save()
        Trip.objects.create(
            city=self.london,
            user=self.user,
            start=dt.date(2021, 8, 1),
            end=dt.date(2021, 8, 5),
        )
        Trip.objects.create(
            city=self.cambridge,
            user=self.user4,
            start=dt.date(2021, 11, 3),
            end=dt.date(2021, 11, 4),
        )
        FRA_trip = Trip.objects.create(
            city=self.frankfurt,
            user=self.user2,
            start=dt.date(2021, 4, 3),
            end=dt.date(2021, 4, 5),
        )
        self.assertEqual(Match.objects.count(), 2)  # user 3 & user; user 4 & user
        self.assertTrue(Match.objects.filter(source_user=self.user3).exists())
        self.assertTrue(Match.objects.filter(target_user=self.user3).exists())

        self.user3.home_city = self.frankfurt
        self.user3.save()

        # Match now in Frankfurt
        self.assertEqual(Match.objects.count(), 1)
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user2,
                target_user=self.user3,
                source_trip=FRA_trip,
                target_trip=None,
                overlap_start=dt.date(2021, 4, 3),
                overlap_end=dt.date(2021, 4, 5),
                distance=0,
            ).exists()
        )

    def test_compute_matches_for_trip_is_atomic(self):
        # i.e. no repeated matches are created
        trip = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 9, 1),
            end=dt.date(2021, 9, 5),
        )
        trip2 = Trip.objects.create(
            city=self.paris,
            user=self.user4,
            start=dt.date(2021, 8, 28),
            end=dt.date(2021, 9, 1),
        )

        trip.compute_matches()
        trip.compute_matches()
        trip2.compute_matches()

        self.assertEqual(Match.objects.count(), 5)
        self.assertTrue(Match.objects.filter(source_user=self.user, target_user=self.user2).exists())
        self.assertTrue(Match.objects.filter(source_user=self.user, target_user=self.user3).exists())
        self.assertTrue(Match.objects.filter(source_user=self.user, target_user=self.user4).exists())
        self.assertTrue(Match.objects.filter(source_user=self.user2, target_user=self.user4).exists())
        self.assertTrue(Match.objects.filter(source_user=self.user3, target_user=self.user4).exists())

    def test_edge_case_match_against_home_city_with_partial_trip_between(self):
        """
        U1 travels to Paris on 16th.
        U2 leaves Paris on 17th.
        U2 returns to Paris on 18th.
        U1 leaves Paris on the 25th.
        """
        Trip.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 10, 17),
            end=dt.date(2021, 10, 18),
        )

        trip1 = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )

        self.assertEqual(Match.objects.count(), 3)

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 17),
                source_trip=trip1,
                target_trip=None,
            ).exists()
        )
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                overlap_start=dt.date(2021, 10, 18),
                overlap_end=dt.date(2021, 10, 25),
                source_trip=trip1,
                target_trip=None,
            ).exists()
        )

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user3,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 25),
                source_trip=trip1,
                target_trip=None,
            ).exists()
        )

    def test_edge_case_match_against_home_city_with_partial_trip_previously_started(self):
        """
        U2 leaves Paris on 14th.
        U1 travels to Paris on 16th.
        U2 returns to Paris on 19th.
        U1 leaves Paris on the 25th.
        """
        Trip.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 10, 14),
            end=dt.date(2021, 10, 19),
        )

        trip1 = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )

        self.assertEqual(Match.objects.count(), 2)

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                overlap_start=dt.date(2021, 10, 19),
                overlap_end=dt.date(2021, 10, 25),
                source_trip=trip1,
                target_trip=None,
            ).exists()
        )

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user3,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 25),
                source_trip=trip1,
                target_trip=None,
            ).exists()
        )

    def test_edge_case_match_with_home_city_is_removed_if_trip_is_added(self):
        trip1 = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                source_trip=trip1,
                target_trip=None,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 25),
                distance=0,
            ).exists()
        )

        # User2 is actually going on a trip on the date range (therefore there's no longer a match)
        Trip.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 10, 15),
            end=dt.date(2021, 10, 26),
        )

        self.assertFalse(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
            ).exists()
        )

    def test_edge_case_match_with_home_city_is_updated_if_partially_overlapping_trip_is_added(self):
        trip1 = Trip.objects.create(
            city=self.paris,
            user=self.user,
            start=dt.date(2021, 10, 16),
            end=dt.date(2021, 10, 25),
        )
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                source_trip=trip1,
                target_trip=None,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 25),
                distance=0,
            ).exists()
        )

        # User2 goes on a trip in the middle of the previous match
        Trip.objects.create(
            city=self.london,
            user=self.user2,
            start=dt.date(2021, 10, 18),
            end=dt.date(2021, 10, 20),
        )

        self.assertEqual(Match.objects.count(), 3)  # cases below & U3/U1 @ CDG

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                overlap_start=dt.date(2021, 10, 16),
                overlap_end=dt.date(2021, 10, 18),
            ).exists()
        )
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user,
                target_user=self.user2,
                overlap_start=dt.date(2021, 10, 20),
                overlap_end=dt.date(2021, 10, 25),
            ).exists()
        )

    def test_edge_case_changing_home_city_with_existing_trips(self):
        self.user3.home_city = self.london
        self.user3.save()
        EDI_trip = Trip.objects.create(
            city=self.edinburgh,
            user=self.user3,
            start=dt.date(2021, 10, 8),
            end=dt.date(2021, 10, 10),
        )
        Trip.objects.create(
            city=self.london,
            user=self.user,
            start=dt.date(2021, 8, 1),
            end=dt.date(2021, 8, 5),
        )

        U4_STN_trip = Trip.objects.create(
            city=self.cambridge,
            user=self.user4,
            start=dt.date(2021, 11, 3),
            end=dt.date(2021, 11, 4),
        )
        FRA_trip = Trip.objects.create(
            city=self.frankfurt,
            user=self.user2,
            start=dt.date(2021, 4, 3),
            end=dt.date(2021, 4, 5),
        )

        self.assertEqual(Match.objects.count(), 3)  # user 3 & user (LHR); plus cases below

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user3,  # Home base -> LHR
                target_user=self.user4,
                source_trip=None,
                target_trip=U4_STN_trip,
                overlap_start=dt.date(2021, 11, 3),
                overlap_end=dt.date(2021, 11, 4),
            ).exists()
        )

        self.assertTrue(
            Match.objects.filter(
                source_user=self.user3,
                target_user=self.user4,  # Home base -> STN
                source_trip=EDI_trip,
                target_trip=None,
                overlap_start=dt.date(2021, 10, 8),
                overlap_end=dt.date(2021, 10, 10),
            ).exists()
        )

        self.user3.home_city = self.frankfurt
        self.user3.save()

        # Match now in Frankfurt (home city for User3)
        self.assertEqual(Match.objects.count(), 2)
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user2,
                target_user=self.user3,
                source_trip=FRA_trip,
                target_trip=None,
                overlap_start=dt.date(2021, 4, 3),
                overlap_end=dt.date(2021, 4, 5),
                distance=0,
            ).exists()
        )

        # Match in Edinburgh (from a scheduled trip) is kept
        self.assertEqual(Match.objects.count(), 2)
        self.assertTrue(
            Match.objects.filter(
                source_user=self.user3,
                target_user=self.user4,
                source_trip=EDI_trip,
                target_trip=None,
                overlap_start=dt.date(2021, 10, 8),
                overlap_end=dt.date(2021, 10, 10),
                distance=0,
            ).exists()
        )

        # STN trip that previously matched on User's 3 home base @ LHR no longer exists
        self.assertFalse(
            Match.objects.filter(
                source_user=self.user3,  # Home base -> LHR
                target_user=self.user4,
                target_trip=U4_STN_trip,
            ).exists()
        )
