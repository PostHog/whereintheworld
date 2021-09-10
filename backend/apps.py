from django.apps import AppConfig


class WhereInTheWorldConfig(AppConfig):
    name = "backend"
    verbose_name = "#whereintheworld"

    def ready(self):
        import backend.signals  # noqa: F401
