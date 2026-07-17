import cloudinary
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes, permission_classes
from .serializer import registerserializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView

import base64
import uuid

from django.core.files.base import ContentFile
from io import BytesIO


from PIL import Image

import cloudinary.uploader

from base.models import *


ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@api_view(['POST'])
def register(request):
    serializer = registerserializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message':'user created successfully'
        },status=201)
    return Response(serializer.errors,status=400)
    

class LoginView(APIView):
    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user

        return Response({
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userinfo(request):
    user = request.user
    return Response({
        "id":user.id,
        "username":user.username,
        "email":user.email,
        "first_name":user.first_name,
        "last_name":user.last_name,
        "date_joined":user.date_joined,
        "pfp":user.pfp.url if user.pfp else None,
    })
    






@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_pfp(request):

    profile_picture = request.data.get("profile_picture")

    if not profile_picture:
        return Response(
            {
                "error": "No image provided."
            },
            status=400
        )

    try:
        header, encoded = profile_picture.split(";base64,", 1)

        extension = header.split("/")[-1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            return Response(
                {
                    "error": "Invalid image type."
                },
                status=400
            )

        image_bytes = base64.b64decode(encoded)

        # File size check
        if len(image_bytes) > MAX_FILE_SIZE:
            return Response(
                {
                    "error": "Image must be smaller than 10 MB."
                },
                status=400
            )

        # Verify image
        Image.open(BytesIO(image_bytes)).verify()

        file = ContentFile(
            image_bytes,
            name=f"{uuid.uuid4()}.{extension}"
        )

    except Exception:
        return Response(
            {
                "error": "Invalid or corrupted image."
            },
            status=400
        )

    old_public_id = request.user.pfp.public_id if request.user.pfp else None

    try:

        result = cloudinary.uploader.upload(
            file,
            folder="profile_pictures",
            moderation="aws_rek"
        )

        moderation = result.get("moderation", [])

        if moderation:

            status = moderation[0].get("status")

            if status != "approved":

                cloudinary.uploader.destroy(result["public_id"])

                return Response(
                    {
                        "error": "Image rejected by content moderation."
                    },
                    status=400
                )

        request.user.pfp = result["public_id"]
        request.user.save()

        if old_public_id and old_public_id != result["public_id"]:
            cloudinary.uploader.destroy(old_public_id)

        return Response(
            {
                "message": "Profile picture uploaded successfully.",
                "profile_picture": result["secure_url"]
            },
            status=200
        )

    except Exception:
        return Response(
            {
                "error": "Failed to upload image."
            },
            status=500
        )
        
        
@api_view(["GET"])
def courses(request):
    courses = Courses.objects.all()
    data = []
    for course in courses:
        data.append({
            "id": course.id,
            "course_name": course.course_name,
            "course_description": course.course_description,
            "image": course.image.url if course.image else None,
            "lecturer": {
                "id": course.lecturer.id,
                "username": course.lecturer.username,
                "email": course.lecturer.email,
                "first_name": course.lecturer.first_name,
                "last_name": course.lecturer.last_name,
            },
            "number_of_lectures": course.number_of_lectures,
            "duration": course.duration,
            "skill_level": course.skill_level,
            "category_name": course.category.category_name,
            "created_at": course.created_at,
            "updated_at": course.updated_at
        })
    return Response(data)

@api_view(["GET"])
def categories(request):
    categories = Categories.objects.all()
    data = []
    for category in categories:
        data.append({
            "category_name": category.category_name,
        })
    return Response(data)

@api_view(["GET"])
def lectures(request, course_id):
    try:
        course = Courses.objects.get(id=course_id)
    except Courses.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    lectures = course.lectures.all().order_by('lecture_number')
    data = []
    for lecture in lectures:
        data.append({
            "lecture_number": lecture.lecture_number,
            "lecture_name": lecture.lecture_name,
        })
    return Response(data)

@api_view(["GET"])
def lecture_detail(request, course_id, lecture_number):
    try:
        course = Courses.objects.get(id=course_id)
    except Courses.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    try:
        lecture = course.lectures.get(lecture_number=lecture_number)
    except Lecture.DoesNotExist:
        return Response({"error": "Lecture not found."}, status=404)

    data = {
        "lecture_number": lecture.lecture_number,
        "lecture_name": lecture.lecture_name,
        "lecture_description": lecture.lecture_description,
        "pdf_file": lecture.pdf_file.url if lecture.pdf_file else None,
        "meeting_link": lecture.meeting_link,
    }
    return Response(data)

