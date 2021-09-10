from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Trip, calculate_locations_for_user


@receiver(post_save, sender=Trip)
def trip_post_save(sender, instance, created, **kwargs):
    calculate_locations_for_user(instance.user)
