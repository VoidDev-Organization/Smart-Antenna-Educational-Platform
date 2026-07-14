import cloudinary
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes, permission_classes
from .serializer import registerserializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

import base64
import uuid

from django.core.files.base import ContentFile


from PIL import Image

import cloudinary.uploader


ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
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

        header, encoded = profile_picture.split(";base64,")

        extension = header.split("/")[-1]

        file = ContentFile(
            base64.b64decode(encoded),
            name=f"{uuid.uuid4()}.{extension}"
        )

    except Exception:

        return Response(
            {
                "error": "Invalid image."
            },
            status=400
        )

    try:

        result = cloudinary.uploader.upload(
            file,
            folder="profile_pictures",
            moderation="aws_rek"
        )

        request.user.pfp = result["public_id"]

        request.user.save()

        return Response(
            {
                "profile_picture": result["secure_url"]
            }
        )

    except Exception as e:

        return Response(
            {
                "error": str(e)
            },
            status=500)