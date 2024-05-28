from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home-todo'),
    path('concluidos/', views.concluidas, name='concluidos'),
    path('listar-todos/', views.listar_todos),
    path('new-todo/',views.new_todo, name='new-todo'),
    path('todo/<int:pk>', views.todo, name='todo'),
    path('teste-pagine/', views.teste_pagine, name='paginacao'),
    path('listar-todos-pagine/', views.listar_todos_paginator),
]
