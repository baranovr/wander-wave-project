from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from user.views import (
    CreateUserViewSet,
    MyProfileView,
    SubscriptionsListView,
    SubscribersListView,
    SubscriptionsDetailView,
    SubscribersDetailView,
)

from wander_wave.views import (
    FavoriteListView,
    FavoriteDetailView,
)


urlpatterns = [
    path("register/", CreateUserViewSet.as_view(), name="register"),
    path("my_profile/", MyProfileView.as_view(), name="my_profile"),

    path("token/", TokenObtainPairView.as_view(), name="create-token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-token"),
    path("token/verify/", TokenVerifyView.as_view(), name="verify"),

    path(
        "my_profile/subscriptions/",
        SubscriptionsListView.as_view(),
        name="subscriptions"
    ),
    path(
        "my_profile/subscriptions/<int:pk>/",
        SubscriptionsDetailView.as_view(),
        name="subscriptions-detail"),
    path(
        "my_profile/subscribers/",
        SubscribersListView.as_view(),
        name="subscribers"
    ),
    path(
        "my_profile/subscribers/<int:pk>/",
        SubscribersDetailView.as_view(),
        name="subscribers-detail"
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
