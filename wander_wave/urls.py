from django.urls import path, include
from rest_framework import routers

from wander_wave.views import (
    PostViewSet,
    LocationViewSet,
    HashtagViewSet,
    CommentViewSet,
    LikeViewSet,
    SubscriptionsPostViewSet,
    LocationAutocomplete,
    HashtagAutocompleteView,

)

from user.views import SubscriptionView, UnsubscribeView

router = routers.DefaultRouter()

router.register("posts", PostViewSet, basename="posts")
router.register(
    "subscriptions-posts",
    SubscriptionsPostViewSet,
    basename="subscribed-posts"
)
router.register("locations", LocationViewSet, basename="locations")
router.register("hashtags", HashtagViewSet, basename="hashtags")
router.register("comments", CommentViewSet, basename="comments")
router.register("likes", LikeViewSet, basename="likes")

urlpatterns = [
    path("", include(router.urls)),

    path(
        "hashtags/autocomplete/",
        HashtagAutocompleteView.as_view(),
        name="hashtag-autocomplete"
    ),
    path(
        "locations/autocomplete/",
        LocationAutocomplete.as_view(),
        name="location-autocomplete"
    ),

    path(
        "posts/<int:pk>/author-profile/",
        PostViewSet.as_view({"get": "author"}),
        name="author-profile"
    ),
    path(
        "posts/<int:pk>/set-like/",
        PostViewSet.as_view({"post": "set_like"}),
        name="set-like",
    ),
    path(
        "posts/<int:pk>/add-to-favorites/",
        PostViewSet.as_view({"post": "add_to_favorites"}),
        name="add-to-favorites",
    ),
    path(
        "posts/<int:user_id>/author-profile/subscribe/",
        SubscriptionView.as_view(),
        name="subscribe"
    ),
    path(
        "posts/<int:user_id>/author-profile/unsubscribe/",
        UnsubscribeView.as_view(),
        name="unsubscribe"
    ),
]

app_name = "wander_wave"
