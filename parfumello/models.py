from random import choices

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.

class Brand(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    def __str__(self):
        return self.name


class Note(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Perfume(models.Model):
    name = models.CharField(max_length=100)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='perfumes')
    release_year = models.IntegerField()
    description = models.TextField()
    notes = models.ManyToManyField(Note, related_name='perfumes')
    display_photo = models.ImageField(upload_to='display_photos/', null=True, blank=True)
    review = models.ManyToManyField('UserReview', related_name='perfumes', blank=True)
    average_rating = models.FloatField(default=0.0)
    price = models.FloatField(default=0.0)
    sex = models.CharField(max_length=20, choices=[('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')], default='unisex')
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / reviews.count(), 2)
        return None
    def __str__(self):
        return f"{self.name} - {self.brand.name}"
    
class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField()
    favorite_perfumes = models.ManyToManyField(Perfume, related_name='fans')
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    def __str__(self):
        return self.username

class UserReview(models.Model):
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    comment = models.TextField()
    def __str__(self):
        return f"{self.user.username} - {self.perfume.name} ({self.rating}/5)"
