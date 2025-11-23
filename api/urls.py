from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    CurrentMemberView,
    OnlineMembersView,
    MessageListCreateView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("members/me/", CurrentMemberView.as_view(), name="current-member"),
    path("members/online/", OnlineMembersView.as_view(), name="online-members"),
    path("messages/", MessageListCreateView.as_view(), name="messages"),
]
