from django.utils.text import Truncator

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
        fields = "__all__"


class HashtagDetailSerializer(HashtagSerializer):
    class Meta:
        model = Hashtag
        fields = "__all__"


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "country", "city")


class LocationListSerializer(LocationSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class LocationDetailSerializer(LocationSerializer):
    class Meta:
        model = Location
        fields = "__all__"


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


class PostListSerializer(PostSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def get_content(self, obj):
        return Truncator(obj.content).chars(30)

    class Meta:
        model = Post
        fields = (
            "id",
            "username",
            "photos",
            "location",
            "title",
            "get_content",
            "get_comments_count",
            "hashtags",
            "created_at",
            "updated_at",
        )


class PostDetailSerializer(PostSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "username",
            "full_name",
            "photos",
            "location",
            "title",
            "content",
            "comments",
            "hashtags",
            "created_at",
            "updated_at",
        )


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
        fields = "__all__"


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ("id", "user",)


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
