import os
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify

from wander_wave_project import settings


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


class Post(models.Model):
    photos = models.ImageField(
        upload_to=post_photo_path, blank=True, null=True
    )
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="posts"
    )
    title = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
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

    class Meta:
        unique_together = (("user", "post"),)

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
