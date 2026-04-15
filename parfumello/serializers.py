from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Perfume, Brand, Note, Profile, UserReview, Order, OrderItem

User = get_user_model()

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name"]

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "name"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    favorite_perfumes = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["user", "favorite_perfumes", "profile_pic_url"]

    def get_profile_pic_url(self, obj):
        request = self.context.get('request')
        if obj.profile_pic and request:
            return request.build_absolute_uri(obj.profile_pic.url)
        return None

    def get_favorite_perfumes(self, obj):
        request = self.context.get('request')
        return PerfumeListSerializer(obj.favorite_perfumes.all(), many=True, context={'request': request}).data

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) 
    class Meta:
        model = UserReview
        fields = ["id", "user", "perfume", "rating", "comment", "created_at"]
        read_only_fields = ["user", "created_at"]

class PerfumeListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Perfume
        fields = ["id", "name", "brand", "average_rating", "price", "sex", "release_year", "image_url"]

    def get_average_rating(self, obj):
        return obj.get_average_rating()
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.display_photo and request:
            return request.build_absolute_uri(obj.display_photo.url)
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'perfume', 'perfume_name', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'full_name', 'email', 'address', 'city', 'postal_code', 'country', 'created_at', 'items']


class PerfumeDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Perfume
        fields = ["id", "name", "brand", "release_year", "description", "notes", "reviews", "average_rating", "price", "sex", "image_url"]
    
    def get_average_rating(self, obj):
        return obj.get_average_rating()
    
    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.display_photo and request:
            return request.build_absolute_uri(obj.display_photo.url)
        return None
    
