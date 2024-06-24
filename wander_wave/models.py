import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify

from wander_wave_project import settings


def post_photo_path(instance, filename):
    _, extension = os.path.splitext(filename)
    filename = f"{slugify(instance.title)}-{uuid.uuid4()}{extension}"
    return os.path.join("uploads/posts_photos/", filename)


class Hashtag(models.Model):
    name = models.CharField(max_length=55)

    def __str__(self):
        return f"#{self.name}"


class Post(models.Model):
    photos = models.ImageField(upload_to=post_photo_path)
    title = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    comments = models.ForeignKey(
        Comment, on_delete=models.CASCADE,
        related_name="posts",
        null=True,
        blank=True
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
        Post, on_delete=models.CASCADE, related_name="comments"
    )
    text = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

    class Meta:
        ordering = ["created_date"]
        unique_together = (("post", "text"),)


class Like(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.user} - {self.post}"

    class Meta:
        unique_together = (("user", "post"),)


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
