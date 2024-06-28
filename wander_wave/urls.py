from django.urls import path, include
from rest_framework import routers

from wander_wave.views import (
    PostViewSet,
    LocationViewSet,
    HashtagViewSet,
    CommentViewSet
)

router = routers.DefaultRouter()

router.register("posts", PostViewSet, basename="posts")
router.register("locations", LocationViewSet, basename="locations")
router.register("hashtags", HashtagViewSet, basename="hashtags")
router.register("comments", CommentViewSet, basename="comments")

urlpatterns = router.urls

app_name = "wander_wave"
