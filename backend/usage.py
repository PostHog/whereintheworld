import posthog


def report_user_signed_up(user):
    posthog.identify(user.transactional_id, properties={"email": user.email})
    posthog.capture(
        user.transactional_id,
        "user signed up",
        groups={"team": user.team.transactional_id},
    )


def report_object_created(user, instance):
    properties = instance.analytics_props() if hasattr(instance, "analytics_props") else {}
    posthog.capture(
        user.transactional_id,
        f"{instance.__class__.__name__.lower()} created",
        properties=properties,
        groups={"team": user.team.transactional_id},
    )
