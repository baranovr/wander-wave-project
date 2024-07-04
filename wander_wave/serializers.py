from django.contrib.auth import get_user_model
from django.utils.text import Truncator
from django.urls import reverse

from rest_framework import serializers

from wander_wave.models import (
    Post, Hashtag, Comment, Like, Subscription, Location
)


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ("id", "name",)


class HashtagListSerializer(HashtagSerializer):
    class Meta:
        model = Hashtag
        fields = HashtagSerializer.Meta.fields


class HashtagDetailSerializer(HashtagSerializer):
    class Meta:
        model = Hashtag
        fields = HashtagSerializer.Meta.fields


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "country", "city")


class LocationListSerializer(LocationSerializer):
    class Meta:
        model = Location
        fields = LocationSerializer.Meta.fields


class LocationDetailSerializer(LocationSerializer):
    class Meta:
        model = Location
        fields = LocationSerializer.Meta.fields


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = (
            "id", "post", "text", "user", "created_date", "updated_date",
        )


class CommentListSerializer(CommentSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "post_title", "text", "username", "created_date",)


class CommentDetailSerializer(CommentSerializer):
    class Meta:
        model = Comment
        fields = CommentSerializer.Meta.fields


class CommentInPostSerializer(CommentSerializer):
    class Meta:
        model = Comment
        fields = ("id", "text", "user", "created_date", "updated_date")


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = (
            "id",
            "photos",
            "location",
            "title",
            "content",
            "user",
            "hashtags",
            "created_at",
            "updated_at",
        )


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ("id", "user", "post")


class LikeListSerializer(LikeSerializer):
    user_like = serializers.CharField(source="user.username", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_id = serializers.IntegerField(source="post.id", read_only=True)
    user_post = serializers.CharField(
        source="post.user.username", read_only=True
    )

    class Meta:
        model = Like
        fields = ("id", "user_like", "post_id", "post_title", "user_post")


class LikeDetailSerializer(LikeSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ("id", "user", "post")


class PostListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    hashtags = HashtagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    location = LocationDetailSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()

    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def get_content(self, obj):
        content = obj.content
        return Truncator(content).chars(30)

    def get_title(self, obj):
        return Truncator(obj.title).chars(50)

    class Meta:
        model = Post
        fields = (
            "id",
            "username",
            "photos",
            "location",
            "title",
            "content",
            "likes_count",
            "comments_count",
            "hashtags",
            "created_at",
            "updated_at",
        )


class PostDetailSerializer(
    PostSerializer,
    PostListSerializer,
    CommentSerializer
):
    author_profile = serializers.SerializerMethodField()
    set_like = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_status = serializers.CharField(source="user.status", read_only=True)
    comments = CommentInPostSerializer(many=True, read_only=True)

    def get_content(self, obj):
        return obj.content

    def get_title(self, obj):
        return obj.title

    def get_author_profile(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"/api/platform/posts/{obj.pk}/author-profile/"
        )

    def get_set_like(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"/api/platform/posts/{obj.pk}/set-like/"
        )

    class Meta:
        model = Post
        fields = (
            "id",
            "author_profile",
            "username",
            "user_status",
            "full_name",
            "user_email",
            "photos",
            "location",
            "title",
            "likes_count",
            "content",
            "comments",
            "hashtags",
            "created_at",
            "updated_at",
            "set_like",
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    subscriber = serializers.CharField(
        source="subscriber.username", read_only=True
    )
    subscribed = serializers.CharField(
        source="subscribed.username", read_only=True
    )

    class Meta:
        model = Subscription
        fields = ("id", "subscriber", "subscribed", "created_at")
        read_only_fields = ("created_at",)


class SubscriptionsListSerializer(SubscriptionSerializer):
    class Meta:
        model = Subscription
        fields = ("id", "subscribed",)


class SubscriptionsDetailSerializer(SubscriptionSerializer):
    avatar = serializers.CharField(source="subscribed.avatar", read_only=True)
    username = serializers.CharField(
        source="subscribed.username", read_only=True
    )
    email = serializers.CharField(
        source="subscribed.email", read_only=True
    )
    full_name = serializers.CharField(
        source="subscribed.full_name", read_only=True
    )
    about_user = serializers.CharField(
        source="subscribed.about_me", read_only=True
    )

    class Meta:
        model = Subscription
        fields = (
            "id", "avatar", "username", "full_name", "email", "about_user"
        )
        read_only_fields = ("created_at",)


class SubscribersListSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(source="subscriber.avatar", read_only=True)
    username = serializers.CharField(
        source="subscriber.username", read_only=True
    )
    full_name = serializers.CharField(
        source="subscriber.full_name", read_only=True
    )

    class Meta:
        model = Subscription
        fields = ("id", "avatar", "username", "full_name",)
        read_only_fields = ("created_at",)


class SubscribersDetailSerializer(SubscribersListSerializer):
    class Meta:
        model = Subscription
        fields = SubscribersListSerializer.Meta.fields

