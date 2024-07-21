from django.contrib.auth import get_user_model
from django.utils.text import Truncator

from rest_framework import serializers

from wander_wave.models import (
    Post,
    Hashtag,
    Comment,
    Like,
    Subscription,
    Location,
    Favorite, PostNotification, LikeNotification, CommentNotification,
    # PostPhoto,
)


POSTS_URL = "/api/platform/posts/"
SUBSCRIBERS_URL = "/api/user/my_profile/subscribers/"
SUBSCRIPTIONS_URL = "/api/user/my_profile/subscriptions/"


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


class PostNotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(
        source="sender.username", read_only=True
    )
    post_title = serializers.CharField(
        source="post.title", read_only=True
    )

    class Meta:
        model = PostNotification
        fields = (
            "id",
            "sender_username",
            "post_title",
            "text",
            "is_read",
            "created_at"
        )
        read_only_fields = (
            "id",
            "sender_username",
            "post_title",
            "text",
            "created_at"
        )


class LikeNotificationSerializer(serializers.ModelSerializer):
    liker_username = serializers.CharField(
        source="liker.username", read_only=True
    )
    liked_post_title = serializers.CharField(
        source="like.post.title", read_only=True
    )

    class Meta:
        model = LikeNotification
        fields = (
            "id",
            "liker_username",
            "liked_post_title",
            "text",
            "is_read",
            "created_at"
        )
        read_only_fields = (
            "id",
            "liker_username",
            "liked_post_title",
            "text",
            "created_at"
        )


class CommentNotificationSerializer(serializers.ModelSerializer):
    commentator_username = serializers.CharField(
        source="commentator.username", read_only=True
    )
    commented_post_title = serializers.CharField(
        source="comment.post.title", read_only=True
    )
    comment_text = serializers.CharField(
        source="comment.text", read_only=True
    )

    class Meta:
        model = CommentNotification
        fields = (
            "id",
            "commentator_username",
            "commented_post_title",
            "comment_text",
            "text",
            "is_read",
            "created_at"
        )
        read_only_fields = (
            "id",
            "commentator_username",
            "commented_post_title",
            "comment_text",
            "text",
            "created_at"
        )


# class PostPhotoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PostPhoto
#         fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    # photos = PostPhotoSerializer(many=True, read_only=True)
    # uploaded_photos = serializers.ListField(
    #     child=serializers.ImageField(
    #         allow_empty_file=False,
    #         use_url=False,
    #         write_only=True
    #     )
    # )

    class Meta:
        model = Post
        fields = (
            "id",
            "location",
            "photo",
            # "photos",
            # "uploaded_photos",
            "title",
            "content",
            "user",
            "hashtags",
            "created_at",
            "updated_at",
        )

    # def create(self, validated_data):
    #     uploaded_photos = validated_data.pop("uploaded_photos")
    #     post = Post.objects.create(**validated_data)
    #
    #     for photo in uploaded_photos:
    #         PostPhoto.objects.create(post=post, photo=photo)
    #
    #     return post


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
    location = LocationDetailSerializer(read_only=True)

    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()

    # photos = PostPhotoSerializer(many=True, read_only=True)

    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def get_content(self, obj):
        content = obj.content
        return Truncator(content).chars(130)

    def get_title(self, obj):
        return Truncator(obj.title).chars(50)

    class Meta:
        model = Post
        fields = (
            "id",
            "username",
            "photo",
            # "photos",
            "location",
            "title",
            "content",
            "likes_count",
            "comments_count",
            "hashtags",
            "created_at",
            "updated_at",
        )


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = (
            "id", "post", "text", "created_date", "updated_date",
        )


class CommentListSerializer(CommentSerializer):
    commentator_username = serializers.CharField(
        source="user.username", read_only=True
    )
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "post_title",
            "text",
            "commentator_username",
            "created_date",
        )


class CommentDetailSerializer(CommentSerializer):
    post = PostListSerializer()
    commentator_username = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta:
        model = Comment
        fields = CommentSerializer.Meta.fields + ("commentator_username",)


class CommentInPostSerializer(CommentSerializer):
    class Meta:
        model = Comment
        fields = (
            "id",
            "text",
            "commentator_username",
            "created_date",
            "updated_date"
        )


class PostDetailSerializer(
    PostSerializer,
    PostListSerializer,
    CommentSerializer
):
    author_profile = serializers.SerializerMethodField()
    set_like = serializers.SerializerMethodField()
    add_to_favorites = serializers.SerializerMethodField()

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
            f"{POSTS_URL}{obj.pk}/author-profile/"
        )

    def get_set_like(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{POSTS_URL}{obj.pk}/set-like/"
        )

    def get_add_to_favorites(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{POSTS_URL}{obj.pk}/add-to-favorites/"
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
            "photo",
            # "photos",
            "location",
            "title",
            "likes_count",
            "content",
            "comments",
            "hashtags",
            "created_at",
            "updated_at",
            "set_like",
            "add_to_favorites",
        )


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ("id", "post")


class FavoriteListSerializer(FavoriteSerializer):
    post = PostListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = FavoriteSerializer.Meta.fields


class FavoriteDetailSerializer(FavoriteSerializer):
    post = PostDetailSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = FavoriteSerializer.Meta.fields


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
    avatar = serializers.CharField(source="subscribed.avatar", read_only=True)
    username = serializers.CharField(
        source="subscribed.username", read_only=True
    )
    status = serializers.CharField(source="subscribed.status", read_only=True)
    email = serializers.CharField(
        source="subscribed.email", read_only=True
    )
    full_name = serializers.CharField(
        source="subscribed.full_name", read_only=True
    )
    view_more = serializers.SerializerMethodField()

    def get_view_more(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIPTIONS_URL}{obj.pk}/view_more/"
        )

    class Meta:
        model = Subscription
        fields = (
            "id",
            "avatar",
            "username",
            "status",
            "email",
            "full_name",
            "view_more"
        )


class SubscribersListSerializer(SubscriptionSerializer):
    avatar = serializers.CharField(source="subscriber.avatar", read_only=True)
    username = serializers.CharField(
        source="subscriber.username", read_only=True
    )
    status = serializers.CharField(
        source="subscriber.status", read_only=True
    )
    email = serializers.CharField(
        source="subscriber.email", read_only=True
    )
    full_name = serializers.CharField(
        source="subscriber.full_name", read_only=True
    )
    view_more = serializers.SerializerMethodField()

    def get_view_more(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIBERS_URL}{obj.pk}/view_more/"
        )

    class Meta:
        model = Subscription
        fields = (
            "id",
            "avatar",
            "username",
            "status",
            "email",
            "full_name",
            "view_more"
        )
