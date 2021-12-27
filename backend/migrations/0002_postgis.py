from django.contrib.postgres.operations import CreateExtension
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("backend", "0001_initial"),
    ]

    operations = [CreateExtension("postgis")]
