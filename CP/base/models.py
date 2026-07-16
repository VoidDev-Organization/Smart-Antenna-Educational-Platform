from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    email = models.EmailField(unique=True)
    enrollments = models.ManyToManyField('Enrollments', related_name='users', blank=True)
    roles = models.CharField(max_length=50, choices=[('student', 'Student'), ('lecturer', 'Lecturer')], default='student')

    pfp = CloudinaryField('image', null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


class Categories(models.Model):
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name


class Courses(models.Model):
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    image = CloudinaryField('image', null=True, blank=True)
    lecturer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='courses',
        limit_choices_to={'roles': 'lecturer'}
    )
    duration = models.IntegerField(help_text="Duration in hours")
    skill_level = models.CharField(max_length=50, choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')])
    category = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name='category_courses')
    number_of_lectures = models.PositiveIntegerField(default=0, help_text="Number of lecture entries to create for this course")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.sync_lectures()

    def sync_lectures(self):
        target_count = self.number_of_lectures
        existing_lectures = list(self.lectures.all().order_by('lecture_number'))

        if target_count < len(existing_lectures):
            for lecture in existing_lectures[target_count:]:
                lecture.delete()
        elif target_count > len(existing_lectures):
            for lecture_number in range(len(existing_lectures) + 1, target_count + 1):
                Lecture.objects.create(course=self, lecture_number=lecture_number)

    def __str__(self):
        return self.course_name


class Lecture(models.Model):
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='lectures')
    lecture_number = models.PositiveIntegerField(default=1)
    lecture_name = models.CharField(max_length=255, blank=True)
    pdf_file = models.FileField(upload_to='course_lectures/pdfs/', blank=True, null=True)
    meeting_link = models.URLField(blank=True)

    class Meta:
        ordering = ['lecture_number']
        unique_together = ('course', 'lecture_number')

    def __str__(self):
        return f"Lecture {self.lecture_number} - {self.course.course_name}"


class Enrollments(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrolled_user')
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='enrolled_course')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.course_name}"