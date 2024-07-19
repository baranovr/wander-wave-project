from wander_wave.models import PostNotification, Subscription


def create_post_notification(post):
    subscribers = Subscription.objects.filter(
        subscribed=post.user).values_list(
            "subscriber", flat=True
        )
    post_notifications = []

    for subscriber_id in subscribers:
        post_notification = PostNotification(
            recipient_id=subscriber_id,
            sender=post.user,
            post=post,
            text=f"{post.user.username} has published "
                 f"a new post: {post.title}"
        )
        post_notifications.append(post_notification)
    PostNotification.objects.bulk_create(post_notifications)
