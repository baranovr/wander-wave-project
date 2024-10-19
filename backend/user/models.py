import os
import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db import models

from backend.wander_wave.models import Post


class UserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_staff", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")

        return self._create_user(email, password, **extra_fields)


def avatar_path(instance, filename):
    _, extension = os.path.splitext(filename)
    filename = f"{slugify(instance.username)}-{uuid.uuid4()}{extension}"
    return os.path.join("uploads/avatars/", filename)


class UserStatusTextChoices(models.TextChoices):
    """
    Choices for set user status
    """
    ROAD_TRIPPER = "Road Tripper"
    CRUISER = "Cruiser"
    BACKPACKER = "Backpacker"
    FLYER = "Flyer"
    CYCLIST = "Cyclist"
    HIKER = "Hiker"
    RAIL_EXP = "Railway Explorer"
    SAILOR = "Sailor"
    RVER = "Recreational Vehicle Traveler"
    NOMAD = "Nomad"


class User(AbstractUser):
    avatar = models.ImageField(
        _("avatar"), upload_to=avatar_path, blank=True, null=True
    )
    username = models.CharField(
        _("username"), max_length=50, unique=True
    )
    status = models.CharField(
        _("status"),
        max_length=50,
        choices=UserStatusTextChoices.choices
    )
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=100)
    last_name = models.CharField(_("last name"), max_length=100)
    about_me = models.TextField(_("about me"), blank=True, null=True)
    posts = models.ForeignKey(
        Post,
        blank=True,
        null=True,
        related_name="user_posts",
        on_delete=models.CASCADE
    )
    password = models.CharField(_("password"), max_length=255)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["username", "status", "first_name", "last_name"]

    object = UserManager()
