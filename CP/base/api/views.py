import cloudinary
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes, permission_classes
from .serializer import registerserializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser



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
@parser_classes([MultiPartParser, FormParser])
def upload_pfp(request):
    user = request.user

    img = request.FILES.get("img")

    if not img:
        return Response(
            {"error": "No image uploaded."},
            status=400
        )

    # Check file type
    if img.content_type not in ALLOWED_CONTENT_TYPES:
        return Response(
            {"error": "Invalid image type."},
            status=400
        )

    # Check file size
    if img.size > MAX_FILE_SIZE:
        return Response(
            {"error": "Image must be smaller than 10 MB."},
            status=400
        )

    # Verify that the uploaded file is a real image
    try:
        Image.open(img).verify()
        img.seek(0)  # Reset file pointer after verify()
    except Exception:
        return Response(
            {"error": "Invalid or corrupted image."},
            status=400
        )

    old_public_id = user.pfp.public_id if user.pfp else None

    try:
        result = cloudinary.uploader.upload(
            img,
            folder="profile_pictures",
            moderation="aws_rek"
        )

        # Check moderation result
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

        # Save new image
        user.pfp = result["public_id"]
        user.save()

        # Delete previous image
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