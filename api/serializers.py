from rest_framework import serializers
from api.models import Member, Message


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'is_online', 'last_activity', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_online', 'last_activity']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def create(self, validated_data):
        member = Member(
            username=validated_data['username']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'sender_username', 'text', 'created_at', 'timestamp']
        read_only_fields = ['id', 'sender_id', 'sender_username', 'timestamp', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['text']

    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Текст сообщения не может быть пустым")
        if len(value) > 1000:
            raise serializers.ValidationError("Текст сообщения не может превышать 1000 символов")
        return value
