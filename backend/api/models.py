from django.db import models

# Create your models here.
class OutageReport(models.Model):
    ISSUES = {
        "NW": "No Water",
        "LP": "Low Pressure",
        "PL": "Pipe Leak",
        "DW": "Dirty Water",
    }

    id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=255) # location of pin
    description = models.TextField()
    issuetype = models.CharField(max_length=20, choices=ISSUES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.location} - {self.created_at.strftime('%Y-%m-%d')}"
