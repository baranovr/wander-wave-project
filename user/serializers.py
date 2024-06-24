from rest_framework import serializers

from wander_wave.models import Post, Hashtag, Comment, Like, Subscription


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ("id", "name",)


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = (
            "id",
            "photos",
            "title",
            "content"
            "user",
            "comments",
            "hashtags",
            "created_at",
            "updated_at",
        )


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "text", "user", "created_at", "updated_at",)


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

