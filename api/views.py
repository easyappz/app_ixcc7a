import uuid
import secrets
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import Member, Message
from api.serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    MessageSerializer,
    MessageCreateSerializer
)


class MemberTokenAuthentication(BaseAuthentication):
    """
    Custom token authentication for Member model.
    Token format: 'Token <value>'
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'token':
            raise AuthenticationFailed('Invalid token header format. Expected: Token <value>')
        
        token_value = parts[1]
        
        try:
            member = Member.objects.get(token=token_value)
        except Member.DoesNotExist:
            raise AuthenticationFailed('Invalid token or member not found')
        
        member.last_activity = timezone.now()
        member.is_online = True
        member.save(update_fields=['last_activity', 'is_online'])
        
        return (member, token_value)


class RegisterView(APIView):
    """
    Register a new member.
    """

    @extend_schema(
        request=RegisterSerializer,
        responses={201: MemberSerializer}
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            
            token = secrets.token_urlsafe(32)
            member.token = token
            member.save(update_fields=['token'])
            
            return Response({
                'token': token,
                'member': MemberSerializer(member).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Login an existing member.
    """

    @extend_schema(
        request=LoginSerializer,
        responses={200: MemberSerializer}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not member.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = secrets.token_urlsafe(32)
        member.token = token
        member.is_online = True
        member.save(update_fields=['token', 'is_online'])
        
        return Response({
            'token': token,
            'member': MemberSerializer(member).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout current member.
    """
    authentication_classes = [MemberTokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: {'type': 'object', 'properties': {'message': {'type': 'string'}}}}
    )
    def post(self, request):
        member = request.user
        member.is_online = False
        member.token = ''
        member.save(update_fields=['is_online', 'token'])
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )


class CurrentMemberView(RetrieveAPIView):
    """
    Get current authenticated member.
    """
    authentication_classes = [MemberTokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MemberSerializer

    def get_object(self):
        return self.request.user


class OnlineMembersView(ListAPIView):
    """
    Get list of online members.
    """
    authentication_classes = [MemberTokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(is_online=True)


class MessageListCreateView(ListCreateAPIView):
    """
    List all messages or create a new message.
    """
    authentication_classes = [MemberTokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all().order_by('timestamp')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
