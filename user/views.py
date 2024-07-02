from django.contrib.auth import get_user_model

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from user.serializers import UserSerializer, MyProfileSerializer

from wander_wave.models import Subscription
from wander_wave.serializers import (
    SubscriptionsListSerializer,
    SubscriptionsDetailSerializer,
    SubscribersListSerializer,
    SubscribersDetailSerializer
)


class CreateUserViewSet(generics.CreateAPIView):
    serializer_class = UserSerializer


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MyProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class SubscribeView(APIView):
    def post(self, request, user_id):
        try:
            subscribed_user = get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if subscribed_user == request.user:
            return Response(
                {"message": "You cannot subscribe to yourself!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscription, created = Subscription.objects.get_or_create(
            subscriber=request.user, subscribed=subscribed_user
        )

        if not created:
            return Response(
                {"message": "You are already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "Subscription created successfully"},
            status=status.HTTP_201_CREATED
        )


class SubscribersListView(generics.ListAPIView):
    serializer_class = SubscribersListSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscribed=self.request.user)


class SubscribersDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscribersDetailSerializer

    def get_object(self):
        subscription_id = self.kwargs.get("pk")
        subscription = Subscription.objects.get(
            id=subscription_id, subscribed=self.request.user
        )
        return subscription


class SubscriptionsListView(generics.ListAPIView):
    serializer_class = SubscriptionsListSerializer

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)


class SubscriptionsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionsDetailSerializer

    def get_object(self):
        subscription_id = self.kwargs.get("pk")
        subscription = Subscription.objects.get(
            id=subscription_id, subscriber=self.request.user
        )
        return subscription
