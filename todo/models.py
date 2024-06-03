from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Todo(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.PROTECT)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    data_entrega = models.DateTimeField(null=False, blank=False)
    data_conclusao = models.DateTimeField(null=True)
