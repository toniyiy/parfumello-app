from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django_filters.rest_framework import FilterSet, CharFilter
from rest_framework import viewsets, permissions, generics
from . import models
from .serializers import (PerfumeListSerializer, PerfumeDetailSerializer, 
    BrandSerializer, NoteSerializer, ReviewSerializer, UserSerializer
)


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