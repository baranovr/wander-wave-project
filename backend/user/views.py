from django.contrib.auth import get_user_model
from django.db import IntegrityError

from rest_framework import generics, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from backend.user.serializers import (
    UserSerializer,
    MyProfileSerializer,
    AuthorProfileSerializer
)

from backend.wander_wave.models import Subscription, SubscriptionNotification
from backend.wander_wave.notification_utils.base_notification_viewset import (
    BaseUserNotificationViewSet
)
from backend.wander_wave.notification_utils.notification_functions import (
    create_subscription_notification
)
from backend.wander_wave.serializers import (
    SubscriptionsListSerializer,
    SubscribersListSerializer,
    SubscriptionSerializer,
    SubscriptionNotificationSerializer,
    SubscriptionNotificationListSerializer,
)


class CreateUserViewSet(generics.CreateAPIView):
    serializer_class = UserSerializer


class LogoutView(APIView):
    def post(self, request):
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MyProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class SubscriptionNotificationViewSet(BaseUserNotificationViewSet):
    notification_model = SubscriptionNotification
    serializer_class = SubscriptionNotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "list":
            return SubscriptionNotificationListSerializer

        return SubscriptionNotificationSerializer


class SubscriptionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        try:
            subscribed_user = get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if subscribed_user == request.user:
            return Response(
                {"error": "You cannot subscribe to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subscription, created = Subscription.objects.get_or_create(
                subscriber=request.user,
                subscribed=subscribed_user
            )
            if created:
                notification = create_subscription_notification(
                    request.user, subscribed_user
                )
                return Response(
                    {"message": "Successfully subscribed"},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"message": "You are already subscribed to this user"},
                    status=status.HTTP_200_OK
                )
        except IntegrityError:
            return Response(
                {"error": "Subscription could not be created"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UnsubscribeView(APIView):
    def delete(self, request, user_id):
        try:
            subscribed_user = get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if subscribed_user == request.user:
            return Response(
                {"error": "You cannot unsubscribe to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subscription = Subscription.objects.get(
                subscriber=request.user,
                subscribed=subscribed_user
            )
            subscription.delete()
            Subscription.objects.filter(subscriber=request.user)
            return Response(
                {"message": "You are unsubscribed from this user"},
                status=status.HTTP_200_OK
            )
        except Subscription.DoesNotExist:
            return Response(
                {"error": "You are not subscribed to this user"},
                status=status.HTTP_404_NOT_FOUND
            )


class BaseSubscriptionViewSet(
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet
):
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "list":
            return self.list_serializer_class

        return self.serializer_class

    @action(detail=True, methods=["GET"])
    def view_more(self, request, pk=None):
        sub = self.get_object()
        profile_user = self.get_profile_user(sub)
        serializer = AuthorProfileSerializer(profile_user)
        return Response(serializer.data)

    def get_profile_user(self, sub):
        raise NotImplementedError(
            "Subclasses must implement get_profile_user"
        )


class SubscribersViewSet(BaseSubscriptionViewSet):
    list_serializer_class = SubscribersListSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscribed=self.request.user)

    def get_profile_user(self, sub):
        return sub.subscriber

    @action(detail=True, methods=["DELETE"])
    def remove_subscriber(self, request, pk=None):
        subscription = self.get_object()

        subscription.delete()
        Subscription.objects.filter(subscribed=self.request.user).delete()

        return Response(
            {"message": "Subscriber removed"},
            status=status.HTTP_204_NO_CONTENT
        )


class SubscriptionsViewSet(BaseSubscriptionViewSet):
    list_serializer_class = SubscriptionsListSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)

    def get_profile_user(self, sub):
        return sub.subscribed

    @action(detail=True, methods=["DELETE"])
    def unsubscribe(self, request, pk=None):
        subscription = self.get_object()

        subscription.delete()
        Subscription.objects.filter(subscriber=self.request.user).delete()

        return Response(
            {"message": "Subscription removed"},
            status=status.HTTP_204_NO_CONTENT
        )
