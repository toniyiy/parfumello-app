from django.http import HttpResponse
from django.template import loader

from django_filters.rest_framework import FilterSet, CharFilter
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from . import models
from .serializers import (
    PerfumeListSerializer, PerfumeDetailSerializer,
    BrandSerializer, NoteSerializer, ReviewSerializer,
    ProfileSerializer, RegisterSerializer
)
from .permissions import IsOwner

User = get_user_model()

def index(request):
    return HttpResponse("Welcome to Parfumello!")

def perfumes(request):
    perfumes = models.Perfume.objects.all()
    template = loader.get_template('perfumes.html')
    context = {
        'perfumes': perfumes,
    }
    return HttpResponse(template.render(context, request))

class PerfumeFilter(FilterSet):
    brand = CharFilter(field_name='brand__name', lookup_expr='icontains')
    note = CharFilter(field_name='notes__name', lookup_expr='icontains')
    sex = CharFilter(field_name='sex', lookup_expr='iexact')
    class Meta:
        model = models.Perfume
        fields = ['brand', 'note', 'sex']


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

class PerfumeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Perfume.objects.all()
    search_fields = ['name', 'brand__name', 'notes__name']
    ordering_fields = ['name', 'id']
    filterset_class = PerfumeFilter
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PerfumeDetailSerializer
        return PerfumeListSerializer
    
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = models.UserReview.objects.all().select_related('perfume', 'user')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Note.objects.all().order_by('name')
    serializer_class = NoteSerializer

class RatingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.UserReview.objects.all().select_related('perfume', 'user')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

class PerfumeDetailViewSet(generics.RetrieveAPIView):
    queryset = models.Perfume.objects.all().select_related('brand').prefetch_related('notes', 'reviews')
    serializer_class = PerfumeDetailSerializer
    permission_classes = [permissions.AllowAny] 

class ReviewCreateUpdateViewSet(generics.CreateAPIView, generics.UpdateAPIView):
    queryset = models.UserReview.objects.all().select_related('perfume', 'user')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"detail": "Account created successfully.", "username": user.username},
            status=status.HTTP_201_CREATED
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_favorite(self, request):
        perfume_id = request.data.get('perfume_id')

        try:
            perfume = models.Perfume.objects.get(id=perfume_id)
            request.user.profile.favorite_perfumes.add(perfume)
            return Response({"status": "added"})
        except models.Perfume.DoesNotExist:
            return Response({"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def remove_favorite(self, request):
        perfume_id = request.data.get('perfume_id')

        try:
            perfume = models.Perfume.objects.get(id=perfume_id)
            request.user.profile.favorite_perfumes.remove(perfume)
            return Response({"status": "removed"})
        except models.Perfume.DoesNotExist:
            return Response({"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND)