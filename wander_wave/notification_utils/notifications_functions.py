from wander_wave.models import (
    PostNotification,
    Subscription,
    LikeNotification, CommentNotification
)


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


def create_like_notification(like):
    if like.user != like.post.user:
        post_title = like.post.title
        like_notification = LikeNotification(
            like=like,
            liker=like.user,
            recipient=like.post.user,
            text=f"{like.user.username} liked your post: {post_title}"
        )
        like_notification.save()


def create_comment_notification(comment):
    if comment.user != comment.post.user:
        post_title = comment.post.title
        comment_notification = CommentNotification(
            comment=comment,
            commentator=comment.user,
            recipient=comment.post.user,
            text=f"{comment.user.username} commented on your post"
                 f" {post_title}: {comment.text}"
        )
        comment_notification.save()
