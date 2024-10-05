from rest_framework_simplejwt.views import TokenObtainPairView

from user.custom_token.token_serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
