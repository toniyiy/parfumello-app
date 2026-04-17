from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.

class Brand(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='brand_pics/', null=True, blank=True)
    def __str__(self):
        return self.name


class Note(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class PerfumeNote(models.Model):
    TIER_CHOICES = [
        ('top', 'Top'),
        ('middle', 'Middle'),
        ('base', 'Base'),
    ]
    perfume = models.ForeignKey('Perfume', on_delete=models.CASCADE, related_name='perfume_notes')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='perfume_notes')
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='top')

    class Meta:
        unique_together = ('perfume', 'note')
        ordering = ['tier', 'note__name']

    def __str__(self):
        return f"{self.note.name} ({self.tier}) in {self.perfume.name}"


class Perfume(models.Model):
    name = models.CharField(max_length=100)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='perfumes')
    release_year = models.IntegerField()
    description = models.TextField()
    notes = models.ManyToManyField(Note, through='PerfumeNote', related_name='perfumes')
    display_photo = models.ImageField(upload_to='display_photos/', null=True, blank=True)
    price = models.FloatField(default=0.0)
    sex = models.CharField(max_length=20, choices=[('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')], default='unisex')
    def get_average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 2)
        return 0.0
    def __str__(self):
        return f"{self.name} - {self.brand.name}"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    favorite_perfumes = models.ManyToManyField(Perfume, related_name='fans', blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

class Order(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    total = models.FloatField()
    stripe_payment_intent_id = models.CharField(max_length=200, unique=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    perfume = models.ForeignKey(Perfume, on_delete=models.SET_NULL, null=True, blank=True)
    perfume_name = models.CharField(max_length=100)
    price = models.FloatField()
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.perfume_name}"


class UserReview(models.Model):
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField()
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    class Meta:
        unique_together = ('perfume', 'user')
    def __str__(self):
        return f"{self.user.username} - {self.perfume.name} ({self.rating}/5)"
