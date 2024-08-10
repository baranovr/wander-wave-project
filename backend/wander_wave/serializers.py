import base64

from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.utils.text import Truncator

from rest_framework import serializers

from backend.wander_wave.models import (
    Post,
    Hashtag,
    Comment,
    Like,
    Subscription,
    Location,
    Favorite,
    PostNotification,
    LikeNotification,
    CommentNotification,
    SubscriptionNotification, PostPhoto,
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
        fields = ("id", "country", "city", "name")


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


class SubscriptionNotificationSerializer(serializers.ModelSerializer):
    subscriber_username = serializers.CharField(
        source="subscriber.username", read_only=True
    )
    subscribed_username = serializers.CharField(
        source="recipient.username", read_only=True
    )

    class Meta:
        model = SubscriptionNotification
        fields = (
            "id",
            "subscriber_username",
            "subscribed_username",
            "text",
            "is_read",
            "created_at"
        )
        read_only_fields = (
            "id", "subscriber_username", "subscribed_username", "created_at"
        )


class SubscriptionNotificationListSerializer(
    SubscriptionNotificationSerializer
):
    class Meta:
        model = SubscriptionNotification
        fields = SubscriptionNotificationSerializer.Meta.fields


class PostPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostPhoto
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    photos = PostPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True
    )

    class Meta:
        model = Post
        fields = (
            "id",
            "location",
            "photos",
            "uploaded_photos",
            "title",
            "content",
            "user",
            "hashtags",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        uploaded_photos = validated_data.pop("uploaded_photos", [])
        location_name = validated_data.pop('location_name', None)
        hashtags_data = validated_data.pop('hashtags', [])

        if location_name:
            location, _ = Location.objects.get_or_create(name=location_name.strip())
            validated_data['location'] = location

        post = Post.objects.create(**validated_data)

        for tag_name in hashtags_data:
            tag, _ = Hashtag.objects.get_or_create(name=tag_name.strip())
            post.hashtags.add(tag)

        for photo in uploaded_photos:
            if isinstance(photo, str) and photo.startswith("data:image"):
                format, img_str = photo.split(";base64,")
                ext = format.split("/")[-1]
                photo_data = ContentFile(
                    base64.b64decode(img_str), name=f"photo.{ext}"
                )
            else:
                photo_data = photo

            PostPhoto.objects.create(post=post, photo=photo_data)

        return post


class PostListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    hashtags = HashtagSerializer(many=True, read_only=True)
    location = LocationDetailSerializer(read_only=True)

    likes_count = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()

    photos = PostPhotoSerializer(many=True, read_only=True)

    def get_base_count(self, model, obj):
        return model.objects.filter(post=obj).count()

    def get_likes_count(self, obj):
        return self.get_base_count(Like, obj)

    def get_favorites_count(self, obj):
        return self.get_base_count(Favorite, obj)

    def get_comments_count(self, obj):
        return self.get_base_count(Comment, obj)

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
            "photos",
            "location",
            "title",
            "content",
            "likes_count",
            "favorites_count",
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
    author_username = serializers.CharField(
        source="post.user.username", read_only=True
    )

    class Meta:
        model = Comment
        fields = (
            "id",
            "post_title",
            "author_username",
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
            "photos",
            "location",
            "title",
            "content",
            "likes_count",
            "favorites_count",
            "comments",
            "hashtags",
            "created_at",
            "updated_at",
            "set_like",
            "add_to_favorites",
        )


class BasePostRelatedSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "post")


class BasePostRelatedListSerializer(BasePostRelatedSerializer):
    post = PostListSerializer(read_only=True)

    class Meta(BasePostRelatedSerializer.Meta):
        pass


class BasePostRelatedDetailSerializer(BasePostRelatedSerializer):
    post = PostDetailSerializer(read_only=True)

    class Meta(BasePostRelatedSerializer.Meta):
        pass


class LikeSerializer(BasePostRelatedSerializer):
    class Meta(BasePostRelatedSerializer.Meta):
        model = Like


class LikeListSerializer(BasePostRelatedListSerializer):
    liker_username = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta(BasePostRelatedListSerializer.Meta):
        model = Like
        fields = BasePostRelatedSerializer.Meta.fields + ("liker_username",)


class LikeDetailSerializer(BasePostRelatedDetailSerializer):
    class Meta(BasePostRelatedDetailSerializer.Meta):
        model = Like


class FavoriteSerializer(BasePostRelatedSerializer):
    class Meta(BasePostRelatedSerializer.Meta):
        model = Favorite


class FavoriteListSerializer(BasePostRelatedListSerializer):
    class Meta(BasePostRelatedListSerializer.Meta):
        model = Favorite


class FavoriteDetailSerializer(BasePostRelatedDetailSerializer):
    class Meta(BasePostRelatedDetailSerializer.Meta):
        model = Favorite


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
    email = serializers.CharField(source="subscribed.email", read_only=True)
    full_name = serializers.CharField(
        source="subscribed.full_name", read_only=True
    )
    view_more = serializers.SerializerMethodField()
    unsubscribe = serializers.SerializerMethodField()

    def get_view_more(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIPTIONS_URL}{obj.pk}/view_more/"
        )

    def get_unsubscribe(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIPTIONS_URL}{obj.pk}/unsubscribe/"
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
            "view_more",
            "unsubscribe"
        )


class SubscribersListSerializer(SubscriptionSerializer):
    avatar = serializers.CharField(source="subscriber.avatar", read_only=True)
    username = serializers.CharField(
        source="subscriber.username", read_only=True
    )
    status = serializers.CharField(source="subscriber.status", read_only=True)
    email = serializers.CharField(source="subscriber.email", read_only=True)
    full_name = serializers.CharField(
        source="subscriber.full_name", read_only=True
    )
    view_more = serializers.SerializerMethodField()
    remove_subscriber = serializers.SerializerMethodField()

    def get_view_more(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIBERS_URL}{obj.pk}/view_more/"
        )

    def get_remove_subscriber(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        return request.build_absolute_uri(
            f"{SUBSCRIBERS_URL}{obj.pk}/remove_subscriber/"
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
            "view_more",
            "remove_subscriber"
        )
