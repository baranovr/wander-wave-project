from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from user.models import User, UserStatusTextChoices
from wander_wave.models import Post, Location


class UserModelTest(TestCase):

    def setUp(self):
        self.location = Location.objects.create(country="Country", city="City")

        self.post = Post.objects.create(
            title="Test Post",
            content="Test Content",
            user=User.objects.create_user(
                email="user1@example.com",
                password="testpass123",
                username="testuser1",
                status=UserStatusTextChoices.CYCLIST,
                first_name="Test",
                last_name="User1"
            ),
            location=self.location
        )

    def test_user_creation(self):
        user = User.objects.create_user(
            email="user@example.com",
            password="testpass123",
            username="testuser",
            status=UserStatusTextChoices.NOMAD,
            first_name="Test",
            last_name="User"
        )
        self.assertEqual(user.email, "user@example.com")
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.check_password("testpass123"))
        self.assertEqual(user.status, UserStatusTextChoices.NOMAD)
        self.assertEqual(user.full_name, "Test User")
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)

    def test_superuser_creation(self):
        superuser = User.objects.create_superuser(
            email="superuser@example.com",
            password="superpass123",
            username="superuser",
            status=UserStatusTextChoices.CRUISER,
            first_name="Super",
            last_name="User"
        )
        self.assertEqual(superuser.email, "superuser@example.com")
        self.assertTrue(superuser.check_password("superpass123"))
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)

    def test_user_without_credentials(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="",
                password="",
                username="",
                status="",
                first_name="",
                last_name=""
            )

    def test_superuser_must_have_superuser_true(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="superuser@example.com",
                password="superpass123",
                username="superuser",
                is_superuser=False
            )

    def test_superuser_must_have_staff_true(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="superuser@example.com",
                password="superpass123",
                username="superuser",
                is_staff=False
            )

    def test_avatar_upload(self):
        avatar = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
        user = User.objects.create_user(
            email="avataruser@example.com",
            password="testpass123",
            username="avataruser",
            avatar=avatar,
            status=UserStatusTextChoices.RAIL_EXP,
            first_name="Avatar",
            last_name="User"
        )
        self.assertTrue(user.avatar.name.startswith("uploads/avatars/avataruser-"))
        self.assertTrue(user.avatar.name.endswith(".jpg"))

    def test_user_full_name(self):
        user = User.objects.create_user(
            email="user@example.com",
            password="testpass123",
            username="testuser",
            first_name="Test",
            last_name="User",
            status=UserStatusTextChoices.FLYER
        )
        self.assertEqual(user.full_name, "Test User")

    def test_user_status_choices(self):
        user = User.objects.create_user(
            email="user@example.com",
            password="testpass123",
            username="statususer",
            first_name="Status",
            last_name="User",
            status=UserStatusTextChoices.CYCLIST
        )
        self.assertEqual(user.status, UserStatusTextChoices.CYCLIST)
        self.assertIn(user.status, UserStatusTextChoices.values)
