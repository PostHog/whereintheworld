from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Trip, User


@receiver(post_save, sender=Trip)
def trip_post_save(sender, instance, created, **kwargs):
    if created:
        instance.compute_matches()


@receiver(pre_save, sender=User)
def user_pre_save(sender, instance, **kwargs):
    if instance.pk:
        current_home_city = User.objects.get(pk=instance.pk).home_city

        if current_home_city != instance.home_city:
            instance._home_city_changed = True


@receiver(post_save, sender=User)
def user_post_save(sender, instance, **kwargs):
    if instance._home_city_changed:
        instance.handle_home_city_change()
