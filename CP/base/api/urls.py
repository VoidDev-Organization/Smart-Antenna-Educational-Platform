from django.urls import path
from . import views

urlpatterns=[
    path('register/',views.register),
    path("login/", views.LoginView.as_view()),
    path('userinfo/',views.userinfo),
    path('upload_pfp/',views.upload_pfp),
    path('test_pfp/',views.test_pfp),

]