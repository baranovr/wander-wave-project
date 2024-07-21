from rest_framework.permissions import IsAuthenticated

from wander_wave.notification_utils.base_notification_actions import (
    BaseNotificationActionsViewSet
)


class BaseUserNotificationViewSet(BaseNotificationActionsViewSet):
    permission_classes = [IsAuthenticated,]

    notification_model = None
    serializer_class = None

    def get_queryset(self):
        if self.notification_model is None:
            raise NotImplementedError(
                "notification_model must be set in subclass"
            )
        return self.notification_model.objects.filter(
            recipient=self.request.user
        )
