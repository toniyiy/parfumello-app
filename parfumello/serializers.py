from rest_framework import serializers
from .models import Perfume, Brand, Note, User, UserReview

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
        fields = ["id", "username", "email", "favorite_perfumes", "profile_pic"]

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer() 
    class Meta:
        model = UserReview
        fields = ["id", "user", "perfume", "rating", "comment", "created_at"]
        read_only_fields = ["user", "created_at"]

class PerfumeListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = Perfume
        fields = ["id", "name", "brand", "average_rating", "price", "sex", "display_photo"]

    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.display_photo and request:
            return request.build_absolute_uri(obj.display_photo.url)
        return None

class PerfumeDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Perfume
        fields = ["id", "name", "brand", "release_year", "description", "notes", "reviews", "average_rating", "price", "sex", "display_photo"]
    
    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.display_photo and request:
            return request.build_absolute_uri(obj.display_photo.url)
        return None
    
