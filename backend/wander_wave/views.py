from datetime import datetime

from django.shortcuts import get_object_or_404

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter

from rest_framework import viewsets, status, mixins, permissions, generics
from rest_framework.decorators import action
from rest_framework.generics import (
    ListAPIView,
    RetrieveDestroyAPIView
)
from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser,
)
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from backend.user.serializers import AuthorProfileSerializer
from backend.wander_wave.models import (
    Post,
    Location,
    Like,
    Comment,
    Subscription,
    Hashtag,
    Favorite,
    PostNotification,
    LikeNotification,
    CommentNotification,
)
from backend.wander_wave.notification_utils.base_notification_viewset import (
    BaseUserNotificationViewSet
)
from backend.wander_wave.notification_utils.notification_functions import (
    create_post_notification,
    create_like_notification,
    create_comment_notification
)
from backend.wander_wave.serializers import (
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
    FavoriteSerializer,
    FavoriteListSerializer,
    FavoriteDetailSerializer,
    PostNotificationSerializer,
    LikeNotificationSerializer,
    CommentNotificationSerializer,
)


class HashtagViewSet(viewsets.ModelViewSet):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminUser()]
        else:
            return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            return HashtagListSerializer

        if self.action == "retrieve":
            return HashtagDetailSerializer

        return HashtagSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminUser()]
        else:
            return [IsAuthenticated()]

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


class HashtagAutocompleteView(generics.ListCreateAPIView):
    serializer_class = HashtagSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return Hashtag.objects.filter(name__icontains__istartswith=query)[:10]

    def create(self, request, *args, **kwargs):
        name = request.data.get("name", "")
        hashtag, created = Hashtag.objects.get_or_create(name=name)
        serializer = self.get_serializer(hashtag)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class LocationAutocomplete(generics.ListCreateAPIView):
    serializer_class = LocationSerializer

    def get_queryset(self):
        query = self.request.query_params.get("query", "")
        return Location.objects.filter(name__icontains=query)[:10]

    def create(self, request, *args, **kwargs):
        name = request.data.get("name", "")
        country, city = name.split(",") if "," in name else (name, "")
        location, created = Location.objects.get_or_create(
            country=country.strip(),
            city=city.strip(),
            defaults={"name": name}
        )
        serializer = self.get_serializer(location)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class PostNotificationViewSet(BaseUserNotificationViewSet):
    notification_model = PostNotification
    serializer_class = PostNotificationSerializer


class LikeNotificationViewSet(BaseUserNotificationViewSet):
    notification_model = LikeNotification
    serializer_class = LikeNotificationSerializer


class CommentNotificationViewSet(BaseUserNotificationViewSet):
    notification_model = CommentNotification
    serializer_class = CommentNotificationSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.action == "list":
            return [permissions.AllowAny()]
        elif self.action == "retrieve":
            return [permissions.IsAuthenticatedOrReadOnly()]
        else:
            return [permissions.IsAuthenticated()]

    def get_queryset(self):
        location = self.request.query_params.get("location", None)
        country = self.request.query_params.get("country", None)
        city = self.request.query_params.get("city", None)
        username = self.request.query_params.get("user__username", None)
        created_at = self.request.query_params.get("created_at", None)
        tags = self.request.query_params.getlist("tags", None)

        queryset = self.queryset

        if location:
            queryset = queryset.filter(location__name__icontains=location)

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
        post = serializer.save(user=self.request.user)
        create_post_notification(post)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        post = get_object_or_404(
            Post, pk=kwargs["pk"], user=self.request.user
        )
        serializer = self.get_serializer(
            post, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        post = get_object_or_404(Post, pk=kwargs["pk"])
        author = post.user

        if author != request.user:
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
        create_like_notification(like)
        return Response(
            like_serializer.data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["POST"])
    def add_to_favorites(self, request, pk=None):
        post = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, post=post
        )

        if not created:
            return Response(
                {"message": "You have already favorited this post!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        favorite_serializer = FavoriteSerializer(favorite)
        return Response(
            favorite_serializer.data, status=status.HTTP_201_CREATED
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
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        subscribed_users = (
            Subscription.objects.filter(
                subscriber=user
            ).values_list("subscribed", flat=True)
        )
        queryset = Post.objects.filter(
            user__in=subscribed_users
        ).order_by("-created_at")

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer

        if self.action == "retrieve":
            return PostDetailSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action == "list":
            return [permissions.AllowAny()]
        else:
            return [permissions.IsAuthenticated()]

    def get_queryset(self):
        username = self.request.query_params.get("user__username", None)
        created_date = self.request.query_params.get("created_date", None)

        queryset = self.queryset

        if username:
            queryset = self.queryset.filter(username__icontains=username)

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
        comment = serializer.save(user=self.request.user)
        create_comment_notification(comment)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        comment = get_object_or_404(
            Comment, pk=kwargs["pk"], user=self.request.user
        )
        serializer = self.get_serializer(comment, data=request.data)
        serializer.is_valid(raise_exception=True)
        commentator = comment.user

        if self.request.user != commentator.user:
            return Response(
                status=status.HTTP_403_FORBIDDEN,
                data={
                    "message": "You do not have permission "
                               "to update this comment."
                }
            )

        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        comment = get_object_or_404(Comment, pk=kwargs["pk"])
        post = comment.post
        author = post.user
        commentator = comment.user

        if author != request.user and commentator != request.user:
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
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        username = self.request.query_params.get("user__username")
        post_title = self.request.query_params.get("post__title")
        queryset = self.queryset

        if username:
            queryset = queryset.filter(user__username__icontains=username)

        if post_title:
            queryset = queryset.filter(post__title__icontains=post_title)

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

    def destroy(self, request, *args, **kwargs):
        like = get_object_or_404(Like, pk=kwargs["pk"])
        liker = like.user

        if liker != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


class LikeListView(generics.ListAPIView):
    serializer_class = LikeListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user)


class LikeDetailView(generics.RetrieveAPIView):
    serializer_class = LikeDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        like_id = self.kwargs["pk"]
        like = Like.objects.get(pk=like_id, user=self.request.user)
        return like


class FavoriteListView(ListAPIView):
    serializer_class = FavoriteListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FavoriteDetailView(RetrieveDestroyAPIView):
    serializer_class = FavoriteDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        favorite_id = self.kwargs["pk"]
        favorite = Favorite.objects.get(
            pk=favorite_id, user=self.request.user
        )
        return favorite
