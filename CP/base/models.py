from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    email = models.EmailField(unique=True)
    enrollments = models.ManyToManyField('Enrollments', related_name='users', blank=True)
    role = models.CharField(max_length=50, default='student')
    
    pfp = CloudinaryField('image', null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []



class Categories(models.Model):
    category_name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.category_name

class Courses(models.Model):
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    image = CloudinaryField('image', null=True, blank=True)
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    duration = models.IntegerField(help_text="Duration in hours")
    skill_level = models.CharField(max_length=50, choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')])
    category = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name='category_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at', '-created_at']
        
    def __str__(self):
        return self.course_name
    
    

    
class Enrollments(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrolled_user')
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='enrolled_course')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'course')
        
    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.course_name}"