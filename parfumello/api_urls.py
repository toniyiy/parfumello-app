from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import (
    BrandViewSet, NoteViewSet, PerfumeViewSet, ReviewViewSet,
    ProfileViewSet, RegisterView,
    CreatePaymentIntentView, PlaceOrderView, OrderListView,
    ContactView,
)

router = DefaultRouter()
router.register(r"brands", BrandViewSet)
router.register(r"notes", NoteViewSet)
router.register(r"perfumes", PerfumeViewSet)
router.register(r"reviews", ReviewViewSet)
router.register(r"profile", ProfileViewSet, basename="profile")

urlpatterns = router.urls + [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="auth-token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("checkout/payment-intent/", CreatePaymentIntentView.as_view(), name="checkout-payment-intent"),
    path("orders/", PlaceOrderView.as_view(), name="place-order"),
    path("orders/history/", OrderListView.as_view(), name="order-history"),
    path("contact/", ContactView.as_view(), name="contact"),
]
