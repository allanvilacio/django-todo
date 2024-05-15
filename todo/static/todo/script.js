function listarTodos() {
    fetch('/listar-todos/')
        .then(response => response.json())
        .then(todos => {
            tbody = document.querySelector('#lista-todos tbody')
            tbody.innerHTML = ''
            todos = JSON.parse(todos);
            todos.forEach(todo => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <th scope="row">${todo.pk}</th>
                    <td>${todo.fields.titulo}</td>
                    <td>${new Date(todo.fields.data_criacao).toLocaleString()}</td>
                    <td>${new Date(todo.fields.data_entrega).toLocaleDateString()}</td>
                    <td>${todo.fields.data_conclusao ? new Date(todo.fields.data_conclusao).toLocaleDateString(): ''}</td>
                    <td>
                        <button type="button" class="btn btn-success btn-sm" onclick='abrirModalConcluir(${todo.pk},${JSON.stringify(todo.fields)})'>Concluir</button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick='abrirModalEditar(${todo.pk},${JSON.stringify(todo.fields)})'>Editar</button>
                        <button type="button" class="btn btn-danger btn-sm" onclick='abrirModalDelete(${todo.pk}, ${JSON.stringify(todo.fields)})'>Excluir</button>
                    </td>
                    `;
                tbody.appendChild(tr);
            });
        });
}

function newTodo(event){
    event.preventDefault()
    let form = document.querySelector('#form-nova-tarefa')
    let csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value
    let titulo = form.querySelector('[name="titulo"]').value
    let descricao = form.querySelector('[name="descricao"]').value
    let data_entrega = form.querySelector('[name="data_entrega"]').value
    
    fetch("/new-todo/", {
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            'titulo':titulo,
            'descricao':descricao,
            'data_entrega':data_entrega})
    })
    .then(response => response.json())
    .then(data => {
        listarTodos()
    })
    .catch(error => {console.error(error)})

}

function deleteTodo(pk){
    let csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
    fetch(`todo/${pk}`, {
        method:'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data =>{
        listarTodos();
    })
}

function abrirModalDelete(pk, fields){
    let btnDelete = document.querySelector('#btn-delete-todo');
    btnDelete.setAttribute('onclick', `deleteTodo(${pk})`);
    let titulo = document.querySelector('#modalTodoDelete #titulo');
    let descricao = document.querySelector('#modalTodoDelete #descricao');
    titulo.innerHTML = `${fields.titulo}`;
    descricao.innerHTML = `${fields.descricao}`;
    new bootstrap.Modal('#modalTodoDelete').show();
}

function concluirTodo(event, pk){
    event.preventDefault();
    let data_conclusao = document.querySelector('#modalTodoConcluir #data-conclusao').value;
    let csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
    fetch(`/todo/${pk}`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(
            {'data_conclusao':data_conclusao}
        )
    })
    .then(response => response.json())
    .then(data =>{
        listarTodos()
    })

}

function abrirModalConcluir(pk, fields){
    let fornConcluir = document.querySelector('#form-modal-concluir');
    fornConcluir.setAttribute('onsubmit', `concluirTodo(event, ${pk})`);
    
    let titulo = document.querySelector('#modalTodoConcluir #titulo');
    let descricao = document.querySelector('#modalTodoConcluir #descricao');
    titulo.innerHTML = fields.titulo;
    descricao.innerHTML = fields.descricao;
    new bootstrap.Modal('#modalTodoConcluir').show();
}

function editarTodo(event, pk){
    event.preventDefault();
    let titulo = document.querySelector('#form-modal-editar #titulo').value;
    let descricao = document.querySelector('#form-modal-editar #descricao').value;
    let data_entrega = document.querySelector('#form-modal-editar #data_entrega').value;
    let csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;

    fetch(`/todo/${pk}`, {
        method:'PUT',
        headers: {
            'Content-Type':'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            'titulo':titulo,
            'descricao':descricao,
            'data_entrega':data_entrega
        })
    })
    .then(response => response.json())
    .then(data =>{
        listarTodos()
    })

}

function abrirModalEditar(pk, fields){
    let fornEditar = document.querySelector('#form-modal-editar');
    fornEditar.setAttribute('onsubmit', `editarTodo(event, ${pk})`);

    let titulo = document.querySelector('#form-modal-editar #titulo');
    let descricao = document.querySelector('#form-modal-editar #descricao');
    let data_entrega = document.querySelector('#form-modal-editar #data_entrega');

    titulo.setAttribute('value', fields.titulo);
    descricao.innerHTML = fields.descricao;
    data_entrega.setAttribute('value', new Date(fields.data_entrega).toISOString().split('T')[0]);
    new bootstrap.Modal('#modalTodoEditar').show();
}


window.addEventListener('load',listarTodos)

