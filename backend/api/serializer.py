from rest_framework import serializers
from .models import OutageReport, User, Reaction, Comment

class OutageReportSerializer(serializers.ModelSerializer):
    # This shows the username instead of just a User ID number
    reporter_name = serializers.ReadOnlyField(source='reporter.username')
    
    # These grab the @property counts we talked about earlier
    likes_count = serializers.IntegerField(source='like_count', read_only=True)
    dislikes_count = serializers.IntegerField(source='dislike_count', read_only=True)

    class Meta:
        model = OutageReport
        fields = [
            'id', 'location', 'description', 'issuetype', 
            'latitude', 'longitude', 'reporter_name', 'likes_count', 'dislikes_count',
            'created_at'
        ]
        
class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    likes = serializers.ReadOnlyField(source='like_count')
    dislikes = serializers.ReadOnlyField(source='dislike_count')

    class Meta:
        model = Comment
        fields = ['id', 'outage', 'username', 'description', 'likes', 'dislikes', 'created_at']
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)