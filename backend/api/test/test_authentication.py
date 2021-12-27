from unittest import mock

from rest_framework import status

from backend.models import User
from backend.test.base import APIBaseTest

MOCK_SOCIAL_RESPONSE = {
    "access_token": "123",
    "email": "testemail@posthog.com",
    "name": "John Doe",
}


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

        with self.settings(SOCIAL_AUTH_GOOGLE_OAUTH2_KEY="google.key", SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET="secret"):
            response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # because follow=True
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
