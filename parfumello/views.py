import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django_filters.rest_framework import CharFilter, FilterSet, NumberFilter
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models
from .ml_engine import get_compatibility
from .permissions import IsOwner
from .serializers import (
    BrandSerializer,
    NoteSerializer,
    OrderSerializer,
    PerfumeDetailSerializer,
    PerfumeListSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ReviewSerializer,
)

User = get_user_model()


class PerfumeFilter(FilterSet):
    brand = CharFilter(field_name="brand__name", lookup_expr="icontains")
    brand_id = NumberFilter(field_name="brand__id")
    note = CharFilter(field_name="notes__name", lookup_expr="icontains")
    sex = CharFilter(field_name="sex", lookup_expr="iexact")

    class Meta:
        model = models.Perfume
        fields = ["brand", "brand_id", "note", "sex"]


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"], url_path="top")
    def top(self, request):
        from django.db.models import F, Sum

        top_brands = (
            models.Brand.objects.annotate(
                total_sold=Sum("perfumes__orderitem__quantity")
            )
            .filter(total_sold__isnull=False)
            .order_by("-total_sold")[:3]
        )
        serializer = self.get_serializer(
            top_brands, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PerfumeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Perfume.objects.all()
    search_fields = ["name", "brand__name", "notes__name"]
    ordering_fields = ["name", "id"]
    filterset_class = PerfumeFilter

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PerfumeDetailSerializer
        return PerfumeListSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = models.UserReview.objects.all().select_related("perfume", "user")
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Note.objects.all().order_by("name")
    serializer_class = NoteSerializer


class PerfumeDetailViewSet(generics.RetrieveAPIView):
    queryset = (
        models.Perfume.objects.all()
        .select_related("brand")
        .prefetch_related("notes", "reviews")
    )
    serializer_class = PerfumeDetailSerializer
    permission_classes = [permissions.AllowAny]


class ReviewCreateUpdateViewSet(generics.CreateAPIView, generics.UpdateAPIView):
    queryset = models.UserReview.objects.all().select_related("perfume", "user")
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
            status=status.HTTP_201_CREATED,
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def add_favorite(self, request):
        perfume_id = request.data.get("perfume_id")

        try:
            perfume = models.Perfume.objects.get(id=perfume_id)
            request.user.profile.favorite_perfumes.add(perfume)
            return Response({"status": "added"})
        except models.Perfume.DoesNotExist:
            return Response(
                {"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["patch"])
    def update_username(self, request):
        new_username = request.data.get("username", "").strip()
        if not new_username:
            return Response(
                {"error": "Username cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if (
            User.objects.filter(username=new_username)
            .exclude(pk=request.user.pk)
            .exists()
        ):
            return Response(
                {"error": "That username is already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.username = new_username
        request.user.save()
        profile = request.user.profile
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["patch"], parser_classes=[MultiPartParser])
    def update_pic(self, request):
        profile = request.user.profile
        if "profile_pic" in request.FILES:
            profile.profile_pic = request.FILES["profile_pic"]
            profile.save()
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def remove_favorite(self, request):
        perfume_id = request.data.get("perfume_id")

        try:
            perfume = models.Perfume.objects.get(id=perfume_id)
            request.user.profile.favorite_perfumes.remove(perfume)
            return Response({"status": "removed"})
        except models.Perfume.DoesNotExist:
            return Response(
                {"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND
            )


class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        items = request.data.get("items", [])
        if not items:
            return Response(
                {"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST
            )

        item_ids = [item.get("id") for item in items if item.get("id")]
        perfumes = {p.id: p for p in models.Perfume.objects.filter(id__in=item_ids)}

        total_cents = 0
        for item in items:
            perfume = perfumes.get(item.get("id"))
            if not perfume:
                return Response(
                    {"error": f"Perfume not found."}, status=status.HTTP_400_BAD_REQUEST
                )
            total_cents += int(round(perfume.price * item["quantity"] * 100))

        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency="usd",
            metadata={"user_id": str(request.user.id)},
        )

        return Response(
            {"client_secret": intent.client_secret, "payment_intent_id": intent.id}
        )


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        payment_intent_id = request.data.get("payment_intent_id")
        shipping = request.data.get("shipping", {})
        items = request.data.get("items", [])

        if not payment_intent_id or not items or not shipping:
            return Response(
                {"error": "Missing required data."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if intent.status != "succeeded":
            return Response(
                {"error": "Payment not completed."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        try:
            metadata_user_id = intent.metadata["user_id"]
        except (KeyError, AttributeError):
            metadata_user_id = None
        if metadata_user_id != str(request.user.id):
            return Response(
                {"error": "Invalid payment."}, status=status.HTTP_403_FORBIDDEN
            )

        existing = models.Order.objects.filter(
            stripe_payment_intent_id=payment_intent_id
        ).first()
        if existing:
            return Response({"order_id": existing.id})

        item_ids = [item.get("id") for item in items if item.get("id")]
        perfumes = {p.id: p for p in models.Perfume.objects.filter(id__in=item_ids)}

        total = 0
        order_items = []
        for item in items:
            perfume = perfumes.get(item.get("id"))
            real_price = perfume.price if perfume else item.get("price", 0)
            total += real_price * item["quantity"]
            order_items.append((perfume, item, real_price))

        order = models.Order.objects.create(
            user=request.user,
            status="paid",
            total=total,
            stripe_payment_intent_id=payment_intent_id,
            full_name=shipping.get("full_name", ""),
            email=shipping.get("email", ""),
            address=shipping.get("address", ""),
            city=shipping.get("city", ""),
            postal_code=shipping.get("postal_code", ""),
            country=shipping.get("country", ""),
        )

        for perfume, item, real_price in order_items:
            models.OrderItem.objects.create(
                order=order,
                perfume=perfume,
                perfume_name=item["name"],
                price=real_price,
                quantity=item["quantity"],
            )

        return Response({"order_id": order.id}, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            models.Order.objects.filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get("name")
        email = request.data.get("email")
        message = request.data.get("message")
        type = request.data.get("type")

        if not name or not email or not message or not type:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = f"[Parfumello] {type.capitalize()} from {name}"
        body = f"Type: {type}\nFrom: {name} <{email}>\n\n{message}"

        send_mail(subject, body, settings.EMAIL_HOST_USER, [settings.EMAIL_HOST_USER])

        return Response({"detail": "Message sent!"}, status=status.HTTP_200_OK)


class SimilarPerfumesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id):
        try:
            perfume = models.Perfume.objects.get(id=id)
        except models.Perfume.DoesNotExist:
            return Response({"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND)

        if perfume.kaggle_index is None:
            return Response(
                {"error": "Similarity data unavailable for this perfume"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        candidates = (
            models.Perfume.objects.exclude(id=id)
            .exclude(kaggle_index=None)
            .select_related("brand")
        )

        max_price = request.query_params.get("max_price")
        if max_price is not None:
            try:
                candidates = candidates.filter(price__lte=float(max_price))
            except ValueError:
                pass

        scored = []
        for candidate in candidates:
            score = get_compatibility(perfume.kaggle_index, candidate.kaggle_index)
            if score is not None:
                scored.append((score, candidate))

        scored.sort(key=lambda x: x[0], reverse=True)
        top5 = scored[:5]

        serializer = PerfumeListSerializer(
            [c for _, c in top5],
            many=True,
            context={"request": request},
        )

        return Response({
            "perfume_name": perfume.name,
            "similar": [
                {**serializer.data[i], "score": top5[i][0]}
                for i in range(len(top5))
            ],
        })


class CompatibilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id_a, id_b):
        try:
            perfume_a = models.Perfume.objects.get(id=id_a)
            perfume_b = models.Perfume.objects.get(id=id_b)
        except models.Perfume.DoesNotExist:
            return Response(
                {"error": "Perfume not found"}, status=status.HTTP_404_NOT_FOUND
            )

        score = get_compatibility(perfume_a.kaggle_index, perfume_b.kaggle_index)

        if score is None:
            return Response(
                {"error": "Compatibility unavailable for one of these perfumes"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if score >= 55:
            label = "Highly compatible"
        elif score >= 40:
            label = "Compatible"
        else:
            label = "Low compatibility"

        return Response(
            {
                "perfume_a": perfume_a.name,
                "perfume_b": perfume_b.name,
                "score": score,
                "label": label,
            }
        )
