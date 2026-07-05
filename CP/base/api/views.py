from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializer import registerserializer
from dj_rest_auth.views import LoginView

@api_view(['POST'])
def register(request):
    serializer = registerserializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message':'user created successfully'
        },status=201)
    return Response(serializer.errors,status=400)
    

class CustomLoginView(LoginView):

    def get_response(self):
        response = super().get_response()

        response.data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
        }

        return response


