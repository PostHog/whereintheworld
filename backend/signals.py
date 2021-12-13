from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Trip


@receiver(post_save, sender=Trip)
def trip_post_save(sender, instance, created, **kwargs):
    if created:
        instance.compute_matches_for_trip()
