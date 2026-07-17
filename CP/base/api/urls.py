from django.urls import path
from . import views

urlpatterns=[
    path('register/',views.register),
    path("login/", views.LoginView.as_view()),
    path('userinfo/',views.userinfo),
    path('upload_pfp/',views.upload_pfp),
    path('courses/', views.courses),
    path('categories/', views.categories),
    path('lectures/<int:course_id>/', views.lectures),
    path('lecture_detail/<int:course_id>/<int:lecture_number>/', views.lecture_detail),
]