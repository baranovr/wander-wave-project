from django.urls import path, include
from rest_framework import routers

from wander_wave.views import PostViewSet, LocationViewSet, HashtagViewSet

router = routers.DefaultRouter()

router.register("posts", PostViewSet, basename="posts")
router.register("locations", LocationViewSet, basename="locations")
router.register("hashtags", HashtagViewSet, basename="hashtags")

urlpatterns = router.urls

app_name = "wander_wave"
