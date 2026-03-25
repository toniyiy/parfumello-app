from django.urls import include, path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("perfumes/", views.perfumes, name='perfumes'),
    path("parfumello/", views.index, name='parfumello'),
    path("api/", include("parfumello.api_urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("perfumes/<int:pk>/", views.PerfumeDetailViewSet.as_view(), name='perfume-detail'),
]