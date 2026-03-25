from django.contrib import admin
from .models import Brand, Note, Perfume, User, UserReview

admin.site.register(Brand)
admin.site.register(Note)
admin.site.register(Perfume)
admin.site.register(User)
admin.site.register(UserReview)