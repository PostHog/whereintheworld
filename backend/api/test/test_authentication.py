import datetime as dt
from unittest import mock

import jwt
import pytz
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework_jwt.blacklist.models import BlacklistedToken

from backend.models import User
from backend.test.base import APIBaseTest

MOCK_SOCIAL_RESPONSE = {
    "access_token": "123",
    "email": "testemail@posthog.com",
    "name": "John Doe",
}


class TestAuthentication(APIBaseTest):
    def setUp(self):
        super().setUp()
        self.client.logout()

    def test_user_can_login(self):

        response = self.client.post(
            "/api/jwt",
            {"email": self.user.email, "password": self.CONFIG_PASSWORD},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(list(response.data.keys()), ["pk", "token"])

        # We also validate the attributes in the JWT's payload
        decoded_jwt = jwt.decode(response.data["token"], settings.SECRET_KEY, algorithms=["HS256"])
        expected_attrs = ["jti", "sub", "iat", "exp"]

        self.assertEqual(list(decoded_jwt.keys()), expected_attrs)

        self.assertEqual(decoded_jwt["sub"], self.user.email)
        self.assertTrue(
            self.validate_close_date(
                dt.datetime.utcfromtimestamp(decoded_jwt["exp"]).replace(tzinfo=pytz.UTC),
                timezone.now() + dt.timedelta(days=60),
            )
        )
        self.assertTrue(
            self.validate_close_date(
                dt.datetime.utcfromtimestamp(decoded_jwt["iat"]).replace(tzinfo=pytz.UTC),
                timezone.now(),
            )
        )

        # PK attr contains the iat field
        self.assertEqual(int(response.data["pk"].timestamp()), decoded_jwt["iat"])

        # Now we test the token actually works
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + response.data["token"])
        response = self.client.get("/api/users/me")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cannot_login_with_incorrect_credentials(self):
        response = self.client.post("/api/jwt", {"email": self.CONFIG_EMAIL, "password": "pas1"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "type": "validation_error",
                "attr": None,
                "code": "invalid_input",
                "detail": "Unable to log in with provided credentials.",
            },
        )

    def test_inactive_user_cannot_login(self):
        user = User.objects.create(email="inactive@posthog.com", team=self.team, is_active=False)
        user.set_password(self.CONFIG_PASSWORD)
        user.save()
        response = self.client.post(
            "/api/jwt",
            {
                "email": user.email,
                "password": self.CONFIG_PASSWORD,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "type": "validation_error",
                "attr": None,
                "code": "invalid_input",
                "detail": "Unable to log in with provided credentials.",
            },
        )

    def test_cannot_login_without_required_fields(self):
        required_fields = [
            "email",
            "password",
        ]

        self.user.refresh_from_db()
        last_login = self.user.last_login

        for field in required_fields:
            body = {
                "email": self.user.email,
                "password": self.CONFIG_PASSWORD,
            }
            body.pop(field)

            response = self.client.post("/api/jwt", body)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

            self.assertEqual(
                response.data,
                {
                    "type": "validation_error",
                    "code": "required",
                    "detail": "This field is required.",
                    "attr": field,
                },
            )

            self.user.refresh_from_db()
            self.assertEqual(self.user.last_login, last_login)

    def test_user_can_logout_and_token_may_not_be_reused(self):

        blacklisted_token = BlacklistedToken.objects.create(
            token="alpha",
            expires_at=(timezone.now() - dt.timedelta(minutes=2)),
            user=self.user,
        )

        self.auth(self.user)
        response = self.client.post("/api/jwt/logout")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get("/api/users/me")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.assertEqual(
            response.data,
            {
                "type": "authentication_error",
                "code": "permission_denied",
                "detail": "Token is blacklisted.",
                "attr": None,
            },
        )

        # Test that expired blacklisted tokens are removed
        self.assertFalse(BlacklistedToken.objects.filter(pk=blacklisted_token.pk).exists())

    def test_cannot_use_token_for_inactive_user(self):
        user = User.objects.create(email="inactive@posthog.com", team=self.team)
        user.set_password(self.CONFIG_PASSWORD)
        user.save()

        self.auth(user)
        user.is_active = False
        user.save()

        response = self.client.get("/api/users/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json(),
            {
                "type": "authentication_error",
                "code": "authentication_failed",
                "detail": "User account is disabled.",
                "attr": None,
            },
        )


class TestSocialAuthentication(APIBaseTest):
    @mock.patch("social_core.backends.base.BaseAuth.request")
    def test_api_can_use_social_login_to_signup(self, mock_request):
        self.client.logout()

        count = User.objects.count()

        response = self.client.get("/login/google-oauth2/")
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        url = "/complete/google-oauth2/"
        url += f"?code=2&state={response.client.session['google-oauth2_state']}"
        mock_request.return_value.json.return_value = MOCK_SOCIAL_RESPONSE

        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # because follow=True

        # Test the newly issued token
        self.assertEqual(response.request["PATH_INFO"], "/")
        token = response.request["QUERY_STRING"][4:]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
        response = self.client.get("/api/users/me")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # TODO: Pass & check JWT

        self.assertEqual(User.objects.count(), count + 1)
        user = User.objects.last()
        self.assertEqual(user.email, "testemail@posthog.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.team, self.team)  # TODO: Valiate correct team is assigned

    @mock.patch("social_core.backends.base.BaseAuth.request")
    def test_api_can_use_social_login_to_login(self, mock_request):
        self.client.logout()
        User.objects.create(email="testemail@posthog.com", team=self.team)

        count = User.objects.count()

        response = self.client.get("/login/google-oauth2/")
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        url = "/complete/google-oauth2/"
        url += f"?code=2&state={response.client.session['google-oauth2_state']}"
        mock_request.return_value.json.return_value = MOCK_SOCIAL_RESPONSE

        with self.settings(SOCIAL_AUTH_GOOGLE_OAUTH2_KEY="google.key", SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET="secret"):
            response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # because follow=True
        # TODO: Pass & check JWT

        # No new users are created
        self.assertEqual(User.objects.count(), count)
        user = User.objects.last()

        # Name gets updated
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
