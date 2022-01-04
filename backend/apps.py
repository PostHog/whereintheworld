import posthog
from django.apps import AppConfig


class WhereInTheWorldConfig(AppConfig):
    name = "backend"
    verbose_name = "#whereintheworld"

    def ready(self):
        import backend.signals  # noqa: F401

        posthog.api_key = "phc_EJzNlXWFR9fCwwv9hOTMZooUs0UnnlLLwla07KKXvOi"
