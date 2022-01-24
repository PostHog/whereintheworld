import json

import jsonschema
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class JSONValidator:
    def __init__(self, schema):
        self.schema = schema

    def __call__(self, value):
        try:
            _value = json.loads(value) if isinstance(value, str) else value
            jsonschema.validate(instance=_value, schema=self.schema)
        except jsonschema.exceptions.ValidationError as e:
            raise ValidationError(f"Malformed JSON: {e.message}")
        except json.decoder.JSONDecodeError:
            raise ValidationError("Malformed JSON.")
