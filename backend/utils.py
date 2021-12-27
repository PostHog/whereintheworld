import secrets
import string
from typing import Dict

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
    html = template.render(context, request=request)
    return HttpResponse(html)
