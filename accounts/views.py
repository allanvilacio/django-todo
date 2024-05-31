from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth import authenticate, login

def login_view(request):
          
    if request.method=='POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home-todo')
        else:
            return HttpResponse('Usuario ou senha invalido.')
    else:

        return render(request, 'accounts/login.html')