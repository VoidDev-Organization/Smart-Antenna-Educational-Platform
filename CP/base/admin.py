from django.contrib import admin
from .models import Categories, Courses, Enrollments, Lecture, User


class LectureInline(admin.TabularInline):
    model = Lecture
    extra = 0
    fields = ('lecture_number', 'lecture_name', 'pdf_file', 'meeting_link')
    readonly_fields = ('lecture_number',)
    classes = ['collapse']


@admin.register(Courses)
class CoursesAdmin(admin.ModelAdmin):
    inlines = [LectureInline]
    list_display = ('course_name', 'lecturer', 'number_of_lectures', 'created_at')
    search_fields = ('course_name', 'lecturer__username')


admin.site.register(User)
admin.site.register(Categories)
admin.site.register(Enrollments)
admin.site.register(Lecture)
