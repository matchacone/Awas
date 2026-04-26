from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Create your models here.
class OutageReport(models.Model):
    ISSUES = {
        "NW": "No Water",
        "LP": "Low Pressure",
        "PL": "Pipe Leak",
        "DW": "Dirty Water",
    }

    id = models.AutoField(primary_key=True)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=255) # location of pin
    description = models.TextField()
    issuetype = models.CharField(max_length=20, choices=ISSUES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)

    @property
    def like_count(self):
        # This counts reactions linked to THIS report that are 'LIKE'
        return self.reactions.filter(reaction_type='LIKE').count()

    @property
    def dislike_count(self):
        # This counts reactions linked to THIS report that are 'DISLIKE'
        return self.reactions.filter(reaction_type='DISLIKE').count()

    def __str__(self):
        return f"{self.location} - {self.created_at.strftime('%Y-%m-%d')}"

    
class Comment(models.Model):
    # This links the comment to a specific report
    outage = models.ForeignKey(OutageReport, on_delete=models.CASCADE, related_name='comments')
    # This links the comment to the user who wrote it
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def like_count(self):
        return self.reactions.filter(reaction_type='LIKE').count()

    @property
    def dislike_count(self):
        return self.reactions.filter(reaction_type='DISLIKE').count()

    def __str__(self):
        return f"Comment by {self.user.username} on {self.outage.location}"
    
    class Meta:
        ordering = ['-created_at']


class Reaction(models.Model):
    # Define the types of reactions
    REACTION_TYPES = [
        ('LIKE', 'Like'),
        ('DISLIKE', 'Dislike'),
    ]

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    outage = models.ForeignKey(OutageReport, on_delete=models.CASCADE, null=True, blank=True, related_name='reactions')
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE, null=True, blank=True, related_name='reactions')
    
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # This is the "Magic" line: 
        # It prevents a user from reacting to the same report more than once.
        unique_together = ('user', 'outage')

    def __str__(self):
        return f"{self.user.username} - {self.reaction_type} on {self.outage.location}"
