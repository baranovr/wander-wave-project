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

from user.serializers import (
    UserSerializer,
    MyProfileSerializer,
    AuthorProfileSerializer
)

from wander_wave.models import Subscription

from wander_wave.serializers import (
    SubscriptionsListSerializer,
    SubscribersListSerializer,
    SubscriptionSerializer,
)


class CreateUserViewSet(generics.CreateAPIView):
    serializer_class = UserSerializer


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={"detail": str(e)},
            )


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MyProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


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
            return Response(
                {"message": "You are unsubscribed from this user"},
                status=status.HTTP_200_OK
            )
        except Subscription.DoesNotExist:
            return Response(
                {"error": "You are not subscribed to this user"},
                status=status.HTTP_404_NOT_FOUND
            )


class SubscribersViewSet(
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet
):
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "list":
            return SubscribersListSerializer

        return SubscriptionSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscribed=self.request.user)

    @action(detail=True, methods=["GET"])
    def view_more(self, request, pk=None):
        sub = self.get_object()
        serializer = AuthorProfileSerializer(sub.subscriber)
        return Response(serializer.data)

    @action(detail=True, methods=["POST"])
    def destroy(self, request, *args, **kwargs):
        sub = self.get_object()


class SubscriptionsViewSet(
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet
):
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "list":
            return SubscriptionsListSerializer

        return SubscriptionSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)

    @action(detail=True, methods=["GET"])
    def view_more(self, request, pk=None):
        sub = self.get_object()
        serializer = AuthorProfileSerializer(sub.subscribed)
        return Response(serializer.data)
