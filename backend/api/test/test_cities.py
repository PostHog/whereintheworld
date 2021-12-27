from rest_framework import status

from backend.test.base import APIBaseTest


class TestCities(APIBaseTest):
    def test_can_list_and_paginate_cities(self):

        response = self.client.get("/api/cities")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        json_response = response.json()
        self.assertEqual(json_response["count"], len(json_response["results"]))
        self.assertIn("next", json_response)
        self.assertIn("previous", json_response)

        for item in json_response["results"]:
            if item["name"] == "Paris":
                self.assertEqual(item["timezone"], "Europe/Paris")
                self.assertEqual(item["country"]["code"], "FR")
                self.assertEqual(item["country"]["code3"], "FRA")
                self.assertEqual(item["country"]["name"], "France")
                self.assertEqual(item["country"]["tld"], "fr")
                self.assertEqual(item["region"]["name"], "Île-de-France")
                self.assertEqual(item["region"]["code"], "11")
                self.assertEqual(item["location"], [48.864716, 2.349014])
                self.assertEqual(item["kind"], "PPL")

    def test_can_search_cities(self):
        response = self.client.get("/api/cities?search=lon")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        json_response = response.json()
        self.assertEqual(json_response["count"], 1)
        self.assertEqual(json_response["results"][0]["name"], "London")
        self.assertEqual(json_response["results"][0]["location"], [51.509865, -0.118092])
        self.assertEqual(json_response["results"][0]["country"]["code"], "US")
