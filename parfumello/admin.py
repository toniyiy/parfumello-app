from django.contrib import admin
from .models import Brand, Note, Perfume, Profile, UserReview

admin.site.register(Brand)
admin.site.register(Note)
admin.site.register(Perfume)
admin.site.register(Profile)
admin.site.register(UserReview)