from django.shortcuts import render
from django.core.serializers import serialize
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import Todo
import json

# Create your views here.

def index(request):
    return render(request, 'todo/index.html')

def concluidas(request):
    return render(request, 'todo/concluidos.html')

def teste_pagine(request):
    return render(request, 'todo/teste-paginacao.html')

def listar_todos_paginator(request):
    try:
        body =json.loads(request.body) 
        todos = Todo.objects.all()
        paginator = Paginator(todos, 2)
        page_number = body.get('page')
        page_obj = paginator.get_page(page_number)

        todos_paginados = serialize('json', page_obj.object_list)
        return JsonResponse({
            'status': 200,
            'data': todos_paginados,
            'num_pages': paginator.num_pages
        })
    except Exception as e:
        return JsonResponse({'status': 400, 'data': str(e)})

def listar_todos(request):
    try:
        body =json.loads(request.body)
        print(body)
        data_conclusao = body['data_conclusao'].lower() == 'true'

        todos = Todo.objects.filter(data_conclusao__isnull=data_conclusao)
        paginator = Paginator(todos, 2)
        page_number = body.get('page')
        page_obj = paginator.get_page(page_number)

        todos_paginados = serialize('json', page_obj.object_list)
        return JsonResponse({
            'status': 200,
            'data': todos_paginados,
            'num_pages': paginator.num_pages
        })
    except Exception as e:
        return JsonResponse({'status': 400, 'data': str(e)})


def new_todo(request):
    if request.method =='POST':
        try:
            body = json.loads(request.body)
            tarefa = Todo(
                titulo=body.get('titulo'),
                descricao=body.get('descricao'),
                data_entrega=body.get('data_entrega'))
            tarefa.save()
            return JsonResponse({'status':200, 'data':'tarefa cadastrada'})
        except:
            return JsonResponse({'status':400, 'data':'dados invalidos'})

def todo(request, pk):
    if request.method=='DELETE':
        try:
            tarefa = Todo.objects.get(pk=pk)
            tarefa.delete()
            return JsonResponse({'status':200, 'pk': pk})
        except:
            return JsonResponse({'status':400, 'data':'dados invalidos'})
        
    if request.method=='POST':
        try:
            data_conclusao = json.loads(request.body).get('data_conclusao')
            tarefa = Todo.objects.get(pk=pk)
            tarefa.data_conclusao = data_conclusao
            tarefa.save()
            
            return JsonResponse({'status':200, 'pk': tarefa.data_conclusao})
        except:
            return JsonResponse({'status':400, 'data':'dados invalidos'})

    if request.method=='PUT':
        try:
            body = json.loads(request.body)
            tarefa = Todo.objects.get(pk=pk)
            tarefa.titulo = body.get('titulo')
            tarefa.descricao = body.get('descricao')
            tarefa.data_entrega = body.get('data_entrega')
            tarefa.save()

            return JsonResponse({'status':200, 'data':body})
        except:
            return JsonResponse({'status':400, 'data':'dados invalidos'})