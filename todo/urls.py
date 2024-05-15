from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home-todo'),
    path('listar-todos/', views.listar_todos),
    path('new-todo/',views.new_todo, name='new-todo'),
    path('todo/<int:pk>', views.todo, name='todo')
]
