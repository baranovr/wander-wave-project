from django.urls import path, include
from rest_framework import routers

from wander_wave.views import PostViewSet

router = routers.DefaultRouter()

router.register("posts", PostViewSet, basename="posts")

urlpatterns = router.urls

app_name = "wander_wave"
