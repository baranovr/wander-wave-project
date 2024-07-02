from django.urls import path, include
from rest_framework import routers

from wander_wave.views import (
    PostViewSet,
    LocationViewSet,
    HashtagViewSet,
    CommentViewSet,
    LikeViewSet,

)

from user.views import SubscribeView


router = routers.DefaultRouter()

router.register("posts", PostViewSet, basename="posts")
router.register("locations", LocationViewSet, basename="locations")
router.register("hashtags", HashtagViewSet, basename="hashtags")
router.register("comments", CommentViewSet, basename="comments")
router.register("likes", LikeViewSet, basename="likes")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "posts/<int:pk>/author-profile/",
        PostViewSet.as_view({"get": "author"}),
        name="author-profile"
    ),
    path(
        "posts/<int:user_id>/author-profile/subscribe/",
        SubscribeView.as_view(),
        name="subscribe"
    ),
]

app_name = "wander_wave"
