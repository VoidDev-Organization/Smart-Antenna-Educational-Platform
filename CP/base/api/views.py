import cloudinary
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializer import registerserializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
import base64
import uuid
from django.core.files.base import ContentFile



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
@permission_classes([IsAuthenticated])
def upload_pfp(request):
    user = request.user

    

    # If no file, try Base64 image
    img = request.data.get("img")

    if not img:
        return Response({"error": "No image provided."}, status=400)

    try:
        header, data = img.split(";base64,")
        extension = header.split("/")[-1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            return Response({"error": "Invalid file type."}, status=400)

        file = ContentFile(
            base64.b64decode(data),
            name=f"{uuid.uuid4()}.{extension}"
        )

    except Exception:
        return Response({"error": "Invalid image data."}, status=400)

    