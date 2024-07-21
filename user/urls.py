from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from user.views import (
    CreateUserViewSet,
    LogoutView,
    MyProfileView,
    SubscriptionsViewSet,
    SubscribersViewSet,
)

from wander_wave.views import (
    FavoriteListView,
    FavoriteDetailView,
    LikeListView,
    LikeDetailView,
)


urlpatterns = [
    path("register/", CreateUserViewSet.as_view(), name="register"),
    path("my_profile/", MyProfileView.as_view(), name="my_profile"),
    path("my_profile/logout/", LogoutView.as_view(), name="logout"),

    path("token/", TokenObtainPairView.as_view(), name="create-token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-token"),
    path("token/verify/", TokenVerifyView.as_view(), name="verify"),

    path(
        "my_profile/subscriptions/",
        SubscriptionsViewSet.as_view({"get": "list"}),
        name="subscriptions"
    ),
    path(
        "my_profile/subscriptions/<int:pk>/view_more/",
        SubscriptionsViewSet.as_view({"get": "view_more"}),
        name="subscriptions-detail"
    ),
    path(
        "my_profile/subscriptions/<int:pk>/unsubscribe/",
        SubscriptionsViewSet.as_view({"delete": "unsubscribe"}),
        name="subscriptions-unsubscribe"
    ),
    path(
        "my_profile/subscribers/",
        SubscribersViewSet.as_view({"get": "list"}),
        name="subscribers"
    ),
    path(
        "my_profile/subscribers/<int:pk>/view_more/",
        SubscribersViewSet.as_view({"get": "view_more"}),
        name="subscribers-detail"
    ),
    path(
        "my_profile/subscribers/<int:pk>/remove_subscriber/",
        SubscribersViewSet.as_view({"delete": "remove_subscriber"}),
        name="subscribers-remove_subscriber"
    ),

    path(
        "my_profile/my_liked/",
        LikeListView.as_view(),
        name="my_liked"

    ),
    path(
        "my_profile/my_liked/<int:pk>/",
        LikeDetailView.as_view(),
        name="my_liked-detail"
    ),
    path(
        "my_profile/my_favorites/",
        FavoriteListView.as_view(),
        name="my_favorites"

    ),
    path(
        "my_profile/my_favorites/<int:pk>/",
        FavoriteDetailView.as_view(),
        name="my_favorites-detail"
    )
]


app_name = "user"
