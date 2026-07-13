from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    pfp = CloudinaryField('image', null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


# Create your models here.
