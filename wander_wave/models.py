import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify

from wander_wave_project import settings


class PostNotification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_post_notifications"
    )
    post = models.ForeignKey("Post", on_delete=models.CASCADE)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_post_notifications"
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


class FavoriteNotification(models.Model):
    pass


class CommentNotification(models.Model):
    pass


class SubscriptionNotification(models.Model):
    pass


class Location(models.Model):
    country = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    
    @property
    def location(self):
        return f"{self.country}, {self.city}"
    
    class Meta:
        ordering = ["country", "city"]
        unique_together = (("country", "city"),)


class Hashtag(models.Model):
    name = models.CharField(max_length=55)

    def __str__(self):
        return f"#{self.name}"


def post_photo_path(instance, filename):
    _, extension = os.path.splitext(filename)
    filename = f"{slugify(instance.title)}-{uuid.uuid4()}{extension}"
    return os.path.join("uploads/posts_photos/", filename)


# class PostPhoto(models.Model):
#     post = models.ForeignKey("Post", on_delete=models.CASCADE)
#     photo = models.ImageField(upload_to=post_photo_path)


class Post(models.Model):
    photo = models.ImageField(upload_to=post_photo_path, null=True, blank=True)
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE,
        related_name="posts",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True,
    )
    hashtags = models.ManyToManyField(Hashtag)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.title}"

    class Meta:
        ordering = ["created_at"]
        unique_together = (("user", "title"),)


class Comment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True
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
        unique_together = (("user", "text"),)

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
