from django.contrib import admin
from django.urls import include, path
from parfumello import urls as parfumello_urls

urlpatterns = [
    path("", include(parfumello_urls)),
    path('admin/', admin.site.urls),
]
