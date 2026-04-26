from api.models import OutageReport, User, Comment
from api.serializer import OutageReportSerializer, CommentSerializer, UserSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied


class Reports(viewsets.ModelViewSet):
    queryset = OutageReport.objects.all().order_by('-created_at')
    serializer_class = OutageReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    def perform_destroy(self, instance):
        if instance.reporter != self.request.user:
            raise PermissionDenied("You can only delete your own reports.")
        instance.delete()


class Comments(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments.")
        instance.delete()


class Users(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
