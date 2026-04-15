from django.contrib import admin
from .models import Brand, Note, Perfume, Profile, UserReview, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['perfume', 'perfume_name', 'price', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total', 'full_name', 'city', 'country', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'full_name', 'email', 'stripe_payment_intent_id']
    readonly_fields = ['stripe_payment_intent_id', 'created_at']
    inlines = [OrderItemInline]


admin.site.register(Brand)
admin.site.register(Note)
admin.site.register(Perfume)
admin.site.register(Profile)
admin.site.register(UserReview)