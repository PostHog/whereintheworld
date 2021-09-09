from typing import Dict, Optional

from cities.models import City, Country
from django.test import TestCase
from faker import Faker
from rest_framework.test import APITestCase as DRFTestCase

from backend.models import Team, User


class ErrorResponsesMixin:

    ERROR_INVALID_CREDENTIALS = {
        "type": "validation_error",
        "code": "invalid_credentials",
        "detail": "Invalid email or password.",
        "attr": None,
    }

    def not_found_response(
        self, message: str = "Not found."
    ) -> Dict[str, Optional[str]]:
        return {
            "type": "invalid_request",
            "code": "not_found",
            "detail": message,
            "attr": None,
        }

    def permission_denied_response(
        self,
        message: str = "You do not have permission to perform this action.",
    ) -> Dict[str, Optional[str]]:
        return {
            "type": "authentication_error",
            "code": "permission_denied",
            "detail": message,
            "attr": None,
        }

    def method_not_allowed_response(self, method: str) -> Dict[str, Optional[str]]:
        return {
            "type": "invalid_request",
            "code": "method_not_allowed",
            "detail": f'Method "{method}" not allowed.',
            "attr": None,
        }

    def unauthenticated_response(
        self,
        message: str = "Authentication credentials were not provided.",
        code: str = "not_authenticated",
    ) -> Dict[str, Optional[str]]:
        return {
            "type": "authentication_error",
            "code": code,
            "detail": message,
            "attr": None,
        }

    def validation_error_response(
        self,
        message: str = "Malformed request",
        code: str = "invalid_input",
        attr: Optional[str] = None,
    ) -> Dict[str, Optional[str]]:
        return {
            "type": "validation_error",
            "code": code,
            "detail": message,
            "attr": attr,
        }


class TestMixin:
    CONFIG_TEAM_NAME: str = "HogTeam"
    CONFIG_EMAIL: Optional[str] = "test@posthog.com"
    CONFIG_PASSWORD: Optional[str] = "testpassword12345"
    CONFIG_AUTO_LOGIN: bool = True

    # Test data definition stubs
    team: Team = None  # type: ignore
    user: User = None  # type: ignore

    @classmethod
    def setUpTestData(cls):
        fake = Faker()
        cls.team = Team.objects.create(name=cls.CONFIG_TEAM_NAME)
        cls.user = User.objects.create(
            team=cls.team, email=cls.CONFIG_EMAIL, password=cls.CONFIG_PASSWORD
        )

        cls.country = Country.objects.create(
            code="US",
            code3="USA",
            population=1,
            tld="us",
            phone="1",
            postal_code_format="00000",
            postal_code_regex="[0-9]{5}",
            capital="Washington D.C.",
        )

        for _ in range(0, 5):
            City.objects.create(
                country=cls.country,
                name_std=fake.city(),
                location=fake.latlng(),
                population=3,
                kind="PPL",
                timezone=fake.timezone(),
            )


class BaseTest(TestMixin, ErrorResponsesMixin, TestCase):
    """
    Base class for performing Postgres-based backend unit tests on.
    Each class and each test is wrapped inside an atomic block to rollback DB commits after each test.
    Read more: https://docs.djangoproject.com/en/3.1/topics/testing/tools/#testcase
    """

    pass


class APIBaseTest(TestMixin, ErrorResponsesMixin, DRFTestCase):
    """
    Functional API tests using Django REST Framework test suite.
    """

    def setUp(self):
        super().setUp()
        if self.CONFIG_AUTO_LOGIN and self.user:
            self.client.force_login(self.user)
