from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from user.serializers import UserSerializer, MyProfileSerializer

from wander_wave.models import Subscription

from wander_wave.serializers import (
    SubscriptionsListSerializer,
    SubscriptionsDetailSerializer,
    SubscribersListSerializer,
    SubscribersDetailSerializer,
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


class SubscribersListView(generics.ListAPIView):
    serializer_class = SubscribersListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Subscription.objects.filter(subscribed=self.request.user)


class SubscribersDetailView(generics.RetrieveDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscribersDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        subscription_id = self.kwargs.get("pk")
        subscription = Subscription.objects.get(
            id=subscription_id, subscribed=self.request.user
        )
        return subscription


class SubscriptionsListView(generics.ListAPIView):
    serializer_class = SubscriptionsListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)


class SubscriptionsDetailView(generics.RetrieveDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionsDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        subscription_id = self.kwargs.get("pk")
        subscription = Subscription.objects.get(
            id=subscription_id, subscriber=self.request.user
        )
        return subscription
