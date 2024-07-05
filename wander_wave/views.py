from datetime import datetime

from django.contrib.auth import get_user_model
from django.shortcuts import render, get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from user.serializers import AuthorProfileSerializer
from wander_wave.models import (
    Post,
    Location,
    Like,
    Comment,
    Subscription,
    Hashtag
)

from wander_wave.serializers import (
    PostSerializer,
    PostDetailSerializer,
    PostListSerializer,
    LocationSerializer,
    LocationListSerializer,
    LocationDetailSerializer,
    HashtagSerializer,
    HashtagListSerializer,
    HashtagDetailSerializer,
    CommentSerializer,
    CommentListSerializer,
    CommentDetailSerializer,
    LikeSerializer,
    LikeListSerializer,
    LikeDetailSerializer,
)


class HashtagViewSet(viewsets.ModelViewSet):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return HashtagListSerializer

        if self.action == "retrieve":
            return HashtagDetailSerializer

        return HashtagSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_queryset(self):
        city = self.request.query_params.get("city", None)
        country = self.request.query_params.get("country", None)

        queryset = self.queryset

        if city:
            queryset = self.queryset.filter(city__icontains=city)

        if country:
            queryset = self.queryset.filter(country__icontains=country)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "list":
            return LocationListSerializer

        if self.action == "retrieve":
            return LocationDetailSerializer

        return LocationSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "city",
                type=OpenApiTypes.STR,
                style="form",
                description="Filter by city"
            ),
            OpenApiParameter(
                "country",
                type=OpenApiTypes.STR,
                style="form",
                description="Filter by country"
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        List all locations, find specific location.
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        return super().list(request, *args, **kwargs)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_queryset(self):
        location = self.request.query_params.get("location", None)
        country = self.request.query_params.get("country", None)
        city = self.request.query_params.get("city", None)
        username = self.request.query_params.get("user__username", None)
        created_at = self.request.query_params.get("created_at", None)
        tags = self.request.query_params.getlist("tags", None)

        queryset = self.queryset

        if location:
            try:
                location_id = int(location)
                queryset = queryset.filter(location_id=location_id)
            except ValueError:
                pass

        if country:
            queryset = queryset.filter(location__country__icontains=country)

        if city:
            queryset = queryset.filter(location__city__icontains=city)

        if username:
            queryset = queryset.filter(user__username=username)

        if created_at:
            date_c = datetime.strptime(created_at, "%Y-%m-%d").date()
            queryset = queryset.filter(created_at__date=date_c)

        if tags:
            queryset = queryset.filter(hashtags__name__in=tags)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer

        if self.action == "retrieve":
            return PostDetailSerializer

        return PostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        post = get_object_or_404(
            Post, pk=kwargs["pk"], user=self.request.user
        )
        serializer = self.get_serializer(post, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        post = get_object_or_404(Post, pk=kwargs["pk"])
        author = post.user

        if author != self.request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["GET"])
    def author(self, request, pk=None):
        post = self.get_object()
        serializer = AuthorProfileSerializer(post.user)
        
        return Response(serializer.data)

    @action(detail=True, methods=["POST"])
    def set_like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user, post=post
        )

        if not created:
            return Response(
                {"message": "You have already liked this post!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        like_serializer = LikeSerializer(like)
        return Response(
            like_serializer.data, status=status.HTTP_201_CREATED
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "location",
                type=OpenApiTypes.INT,
                description="Filter by location ID"
            ),
            OpenApiParameter(
                "country",
                type=OpenApiTypes.STR,
                description=(
                        "Filter by country (case-insensitive)"
                )
            ),
            OpenApiParameter(
                "city",
                type=OpenApiTypes.STR,
                description="Filter by city (case-insensitive)"
            ),
            OpenApiParameter(
                "user__username",
                type=OpenApiTypes.STR,
                description="Filter by author username"
            ),
            OpenApiParameter(
                "created_at",
                type=OpenApiTypes.DATE,
                description=(
                        "Filter by creation date (ex. ?created_at=2024-04-05)"
                )
            ),
            OpenApiParameter(
                "tags",
                type={"type": "array", "items": {"type": "string"}},
                style="form",
                description="Filter by post tags"
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        List all posts, filter posts by various parameters.
        """
        return super().list(request, *args, **kwargs)


class SubscriptionsPostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PostListSerializer

    def get_queryset(self):
        user = self.request.user
        subscribed_users = (
            Subscription.objects.filter(
                subscriber=user
            ).values_list("subscribed", flat=True)
        )
        return Post.objects.filter(
            user__in=subscribed_users
        ).order_by("-created_at")


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        username = self.request.query_params.get("user__username", None)
        created_date = self.request.query_params.get("created_date", None)

        queryset = self.queryset

        if username:
            queryset = self.queryset.filter(username=username)

        if created_date:
            date_c = datetime.strptime(
                created_date, "%Y-%m-%d"
            ).date()
            queryset = queryset.filter(created_date__date=date_c)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "list":
            return CommentListSerializer

        if self.action == "retrieve":
            return CommentDetailSerializer

        return CommentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        comment = get_object_or_404(
            Comment, pk=kwargs["pk"], user=self.request.user
        )
        serializer = self.get_serializer(comment, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        comment = get_object_or_404(Comment, pk=kwargs["pk"])
        author = post.user
        commentator = comment.user

        if author != self.request.user or commentator != self.request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "username",
                type=OpenApiTypes.STR,
                style="form",
                description="Filter by commentator username"
            ),
            OpenApiParameter(
                "created_at",
                type=OpenApiTypes.DATE,
                description=(
                        "Filter by created creation date "
                        "(ex. ?date=20024-04-05)"
                )
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        List all comments, find specific comment
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        return super().list(request, *args, **kwargs)


class LikeViewSet(
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet
):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

    def get_queryset(self):
        username = self.request.query_params.get("user__username", None)
        post_title = self.request.query_params.get("post__title", None)

        queryset = self.queryset

        if username:
            queryset = self.queryset.filter(username=username)

        if post_title:
            queryset = self.queryset.filter(title=post_title)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "list":
            return LikeListSerializer

        if self.action == "retrieve":
            return LikeDetailSerializer

        return LikeSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "username",
                type=OpenApiTypes.STR,
                style="form",
                description="Filter by liker username"
            ),
            OpenApiParameter(
                "post_title",
                type=OpenApiTypes.STR,
                style="form",
                description="Filer by liked post title"
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        List all likes, find specific like
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        like = get_object_or_404(Like, pk=kwargs["pk"])
        liker = like.user

        if liker != request.user:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return super().destroy(request, *args, **kwargs)
