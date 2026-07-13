from urllib import request

import cloudinary
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializer import registerserializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView


import base64
import uuid
import traceback

from django.core.files.base import ContentFile

import cloudinary.uploader


ALLOWED_EXTENSIONS = {"png","jpg","jpeg","gif", "webp"}



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
        "date_joined":user.date_joined
    })
    
    
    

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def upload_pfp(request):
    user = request.user
    file = request.FILES.get("profile_picture")

    if not file:
        return Response({"error": "No file provided."}, status=400)

    extension = file.name.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return Response({"error": "Invalid file type."}, status=400)

    old_public_id = user.pfp.public_id if user.pfp else None

    try:
        result = cloudinary.uploader.upload(
            file,
            folder="profile_pictures",
            moderation="aws_rek"
        )

        # Save the Cloudinary public_id
        user.pfp = result["public_id"]
        user.save()

        # Delete the previous image
        if old_public_id and old_public_id != result["public_id"]:
            cloudinary.uploader.destroy(old_public_id)

        return Response(
            {
                "message": "Profile picture uploaded successfully.",
                "profile_picture": user.pfp.url,
                "moderation": result.get("moderation")
            },
            status=200
        )

    except Exception as e:
        return Response(
            {
                "error": str(e)
            },
            status=500
        )
        
        
        
        
@api_view(['POST'])
def test_pfp(request):
    
    return Response({"ok": True,
                     'file': request.FILES.get("profile_picture")}, status=200)
    
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_pfp(request):
    try:
        user = request.user

        img = request.data.get("img")

        if not img:
            return Response({"error": "No image provided."}, status=400)

        if ";base64," not in img:
            return Response({"error": "Invalid image format."}, status=400)

        header, data = img.split(";base64,", 1)

        extension = header.split("/")[-1].lower()

        if extension == "jpeg":
            extension = "jpg"

        if extension not in ALLOWED_EXTENSIONS:
            return Response({"error": "Invalid file type."}, status=400)

        file = ContentFile(
            base64.b64decode(data),
            name=f"{uuid.uuid4()}.{extension}",
        )

        old_public_id = user.pfp.public_id if user.pfp else None

        result = cloudinary.uploader.upload(
            file,
            folder="profile_pictures",
            moderation="aws_rek",
        )

        user.pfp = result["public_id"]
        user.save()

        if old_public_id and old_public_id != result["public_id"]:
            cloudinary.uploader.destroy(old_public_id)

        return Response(
            {
                "message": "Profile picture uploaded successfully.",
                "profile_picture": result["secure_url"],
                "moderation": result.get("moderation"),
            },
            status=200,
        )

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=500,
        )
