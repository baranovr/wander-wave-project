from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class BaseNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated,]

    def get_queryset(self):
        raise NotImplementedError(
            "get_queryset() must be implemented in subclasses"
        )

    @action(detail=False, methods=["POST"])
    def mark_all_as_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        if not notifications:
            return Response(
                {
                    "message": "All notification are already marked as read"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        read_count = notifications.update(is_read=True)
        return Response(
            status=status.HTTP_200_OK,
            data={
                "message": "All notification marked as read",
                "read_count": read_count
            }
        )

    @action(detail=True, methods=["POST"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        if not notification:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={"message": "Notification not found"}
            )

        notification.is_read = True
        notification.save()
        return Response(
            status=status.HTTP_200_OK,
            data={"message": "Notification marked as read"}
        )

    @action(detail=False, methods=["DELETE"])
    def delete_all_notifications(self, request, pk=None):
        notifications = self.get_queryset()
        if not notifications:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={"message": "No notification found"}
            )

        deleted_count, _ = notifications.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
            data={
                "message": "All notification deleted",
                "deleted_count": deleted_count
            }
        )

    @action(detail=True, methods=["DELETE"])
    def delete_notification(self, request, pk=None):
        notification = self.get_object()
        if not notification:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={"message": "Notification not found"}
            )

        notification.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
            data={"message": "Notification deleted"}
        )
