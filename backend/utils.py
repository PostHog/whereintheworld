import os
import secrets
import string
from typing import Any, Callable, Dict, List, Optional

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.template.loader import get_template


def random_secret(length=10, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
    return "".join(secrets.choice(chars) for _ in range(length))


def json_time(time):
    assert hasattr(time, "strftime"), "not a valid datetime object."
    return time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def json_date(date):
    assert hasattr(date, "strftime"), "not a valid datetime object."
    return date.strftime("%Y-%m-%d")


def generate_id(prefixer="???", length=24):

    assert 2 <= len(prefixer) <= 5, "prefixer must be between 3 and 5 characters"

    return f"{prefixer}_{random_secret(length)}"


def render_template(template_name: str, request: HttpRequest, context: Dict = {}) -> HttpResponse:
    """
    Sets any backend context and renders frontend.
    """
    template = get_template(template_name)
    context["js_maps_api_key"] = settings.MAPS_API_KEY
    html = template.render(context, request=request)
    return HttpResponse(html)


def str_to_bool(value: Any) -> bool:
    """Return whether the provided string (or any value really) represents true. Otherwise false.
    Just like plugin server stringToBoolean.
    """
    if not value:
        return False
    return str(value).lower() in ("y", "yes", "t", "true", "on", "1")


def get_list(text: str) -> List[str]:
    if not text:
        return []
    return [item.strip() for item in text.split(",")]


def get_from_env(key: str, default: Any = None, *, optional: bool = False, type_cast: Optional[Callable] = None) -> Any:
    value = os.getenv(key)
    if value is None:
        if optional:
            return None
        if default is not None:
            return default
        else:
            raise ImproperlyConfigured(f'The environment variable "{key}" is required to run whereintheworld!')
    if type_cast is not None:
        return type_cast(value)
    return value
