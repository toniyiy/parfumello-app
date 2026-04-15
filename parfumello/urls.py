from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from .views import PerfumeDetailViewSet

urlpatterns = [
    path("api/", include("parfumello.api_urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("perfumes/<int:pk>/", PerfumeDetailViewSet.as_view(), name='perfume-detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
