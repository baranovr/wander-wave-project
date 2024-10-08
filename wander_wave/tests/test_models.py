from django.test import TestCase
from django.contrib.auth import get_user_model
from wander_wave.models import (
    Post,
    Like,
    Favorite,
    Comment,
    Subscription,
    PostNotification,
    LikeNotification,
    CommentNotification,
    SubscriptionNotification,
    Location,
    Hashtag
)

User = get_user_model()

class NotificationModelsTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", email="1@example.com", password="testpass")
        self.user2 = User.objects.create_user(username="user2", email="2@example.com", password="testpass")

        self.location = Location.objects.create(country="Country", city="City")
        self.hashtag = Hashtag.objects.create(name="test")

        self.post = Post.objects.create(
            title="Test Post",
            content="Test content",
            user=self.user1,
            location=self.location,
        )
        self.post.hashtags.add(self.hashtag)

        self.comment = Comment.objects.create(post=self.post, text="Test comment", user=self.user2)
        self.like = Like.objects.create(post=self.post, user=self.user2)
        self.subscription = Subscription.objects.create(subscriber=self.user2, subscribed=self.user1)

    def test_post_notification_creation(self):
        notification = PostNotification.objects.create(
            post=self.post,
            sender=self.user2,
            recipient=self.user1,
            text="New post notification"
        )
        self.assertEqual(notification.text, "New post notification")
        self.assertFalse(notification.is_read)
        self.assertEqual(str(notification), f"Notification for {self.user1.username} about {self.post.title}")

    def test_like_notification_creation(self):
        notification = LikeNotification.objects.create(
            like=self.like,
            liker=self.user2,
            recipient=self.user1,
            text="New like notification"
        )
        self.assertEqual(notification.text, "New like notification")
        self.assertFalse(notification.is_read)
        self.assertEqual(str(notification), f"{self.user2.username} liked {self.like.post.title}")

    def test_comment_notification_creation(self):
        notification = CommentNotification.objects.create(
            comment=self.comment,
            commentator=self.user2,
            recipient=self.user1,
            text="New comment notification"
        )
        self.assertEqual(notification.text, "New comment notification")
        self.assertFalse(notification.is_read)
        self.assertIn(self.comment.text, str(notification))

    def test_subscription_notification_creation(self):
        notification = SubscriptionNotification.objects.create(
            subscription=self.subscription,
            subscriber=self.user2,
            recipient=self.user1,
            text="New subscription notification"
        )
        self.assertEqual(notification.text, "New subscription notification")
        self.assertFalse(notification.is_read)
        self.assertEqual(str(notification), f"{self.user2.username} has subscribed to you")

    def test_location_creation(self):
        location = Location.objects.create(country="USA", city="New York")
        self.assertEqual(location.name, "USA, New York")
        self.assertNotEqual(str(location), "USA, New York")

    def test_hashtag_creation(self):
        hashtag = Hashtag.objects.create(name="coding")
        self.assertEqual(str(hashtag), "#coding")

    def test_post_creation(self):
        post = Post.objects.create(
            title="Another Test Post",
            content="Some content",
            user=self.user1,
            location=self.location
        )
        self.assertEqual(str(post), f"{self.user1} - {post.title}")

    def test_comment_creation(self):
        comment = Comment.objects.create(post=self.post, text="Another comment", user=self.user2)
        self.assertEqual(str(comment), "Another comment")

    def test_like_creation(self):
        like = Like.objects.create(post=self.post, user=self.user2)
        self.assertEqual(str(like), f"{self.user2} - {self.post}")

    def test_favorite_creation(self):
        favorite = Favorite.objects.create(post=self.post, user=self.user2)
        self.assertEqual(str(favorite), f"{self.user2} - {self.post}")

    def test_subscription_creation(self):
        subscription = Subscription.objects.create(subscriber=self.user1, subscribed=self.user2)
        self.assertEqual(str(subscription), f"{self.user1} is subscribed on {self.user2}")
