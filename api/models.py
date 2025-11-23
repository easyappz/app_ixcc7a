from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'member'


class Message(models.Model):
    sender = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender.username}: {self.text[:50]}'

    class Meta:
        ordering = ['timestamp']
        db_table = 'message'
