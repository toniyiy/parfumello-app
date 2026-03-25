from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, NoteViewSet, PerfumeViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r"brands", BrandViewSet)
router.register(r"notes", NoteViewSet)
router.register(r"perfumes", PerfumeViewSet)
router.register(r"reviews", ReviewViewSet)

urlpatterns = router.urls