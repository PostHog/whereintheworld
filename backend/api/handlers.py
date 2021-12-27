import datetime
import uuid

from rest_framework_jwt.settings import api_settings


def jwt_payload_handler(user):

    payload = {
        "jti": str(uuid.uuid4()),
        "sub": user.email,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA,
    }

    return payload


def jwt_get_username_from_payload_handler(payload):
    """
    Overriden because the unique identifier is stored in the sub (per RFC 7519 specs)
    (original rest_framework_jwt.utils.jwt_get_username_from_payload_handler)
    """
    return payload.get("sub")
