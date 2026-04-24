from rest_framework import serializers
from .models import OutageReport

class OutageReportSerializer(serializers.ModelSerializer):
    issue_display = serializers.CharField(source='get_issuetype_display', read_only=True)

    class Meta:
        model = OutageReport
        fields = ['id','location','description','issuetype','issue_display','latitude','longtitude','created_at']