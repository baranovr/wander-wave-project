import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify

from wander_wave_project import settings


class PostNotification(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_post_notifications"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_post_notifications"
    )
    text = models.CharField(max_length=355)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at",]

    def __str__(self):
        return (f"Notification for {self.recipient.username} "
                f"about {self.post.title}")


class LikeNotification(models.Model):
    like = models.ForeignKey("Like", on_delete=models.CASCADE)
    liker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_like_notifications"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_like_notifications"
    )
    text = models.CharField(max_length=355)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.liker.username} liked {self.like.post.title}"


class CommentNotification(models.Model):
    comment = models.ForeignKey("Comment", on_delete=models.CASCADE)
    commentator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_comment_notifications"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_comment_notifications"
    )
    text = models.CharField(max_length=355)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (f"{self.commentator} commented your post:\n"
                f"Post title: {self.comment.post.title}\n"
                f"Comment: {self.comment.text}\n")


class SubscriptionNotification(models.Model):
    subscription = models.ForeignKey("Subscription", on_delete=models.CASCADE)
    subscriber = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_subscription_notifications"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_subscription_notifications"
    )
    text = models.CharField(max_length=355)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subscriber.username} has subscribed to you"


class Location(models.Model):
    country = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    name = models.CharField(max_length=255, unique=True)

    def save(self, *args, **kwargs):
        self.name = f"{self.country}, {self.city}"
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ["country", "city"]
        unique_together = (("country", "city"),)


class Hashtag(models.Model):
    name = models.CharField(max_length=55, unique=True)

    def __str__(self):
        return f"#{self.name}"


def post_photo_path(instance, filename):
    _, extension = os.path.splitext(filename)
    filename = f"{slugify(instance.title)}-{uuid.uuid4()}{extension}"
    return os.path.join("uploads/posts_photos/", filename)


class PostPhoto(models.Model):
    post = models.ForeignKey(
        "Post", related_name="photos", on_delete=models.CASCADE
    )
    photo = models.ImageField(upload_to=post_photo_path)


class Post(models.Model):
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="posts",
    )
    title = models.CharField(max_length=255, unique=False)
    content = models.TextField(null=True, blank=True, unique=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
    )
    hashtags = models.ManyToManyField(Hashtag)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.title}"

    class Meta:
        ordering = ["created_at"]


class Comment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments",
    )
    text = models.TextField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_date"]

    def __str__(self):
        return self.text


class Like(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.user} - {self.post}"


class Favorite(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="favorites"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.user} - {self.post}"


class Subscription(models.Model):
    subscriber = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )
    subscribed = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="subscribers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (("subscriber", "subscribed"),)
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subscriber} is subscribed on {self.subscribed}"
