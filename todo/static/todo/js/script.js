const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken
}

async function listarTodos(){
    try {
        const response = await fetch('/listar-todos/');
        const data = JSON.parse(await response.json());
        const tbody = document.querySelector('#lista-todos tbody');
        tbody.textContent = '';
        
        data.forEach(todo => {
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
                </td>`;
                
            tbody.appendChild(tr);
        })
    } catch (erro){
        console.error(erro);
    }
}

async function newTodo(event){
    event.preventDefault();
    const form = document.querySelector('#form-nova-tarefa');
    const titulo = form.querySelector('[name="titulo"]').value;
    const descricao = form.querySelector('[name="descricao"]').value;
    const data_entrega = form.querySelector('[name="data_entrega"]').value;

    try {
        const response = await fetch('new-todo/', {
            method:'POST',
            headers:headers,
            body: JSON.stringify({
                'titulo':titulo,
                'descricao':descricao,
                'data_entrega':data_entrega
            })
        });
        listarTodos();

    } catch (erro) {
        console.log(erro);
    }
}

async function deleteTodo(pk){
    try {
        const response = await fetch(`todo/${pk}`, {
            method:'DELETE',
            headers:headers,
        });
        listarTodos();
    } catch (error) {
        console.error(error);
    }
}

function abrirModalDelete(pk, fields){
    const btnDelete = document.querySelector('#btn-delete-todo');
    btnDelete.setAttribute('onclick', `deleteTodo(${pk})`);
    const titulo = document.querySelector('#modalTodoDelete #titulo');
    const descricao = document.querySelector('#modalTodoDelete #descricao');
    titulo.textContent = `${fields.titulo}`;
    descricao.textContent = `${fields.descricao}`;
    new bootstrap.Modal('#modalTodoDelete').show();
}

async function concluirTodo(event, pk){
    event.preventDefault();
    const data_conclusao = document.querySelector('#modalTodoConcluir #data-conclusao').value;
    
    try {
        const response = await fetch(`/todo/${pk}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                'data_conclusao':data_conclusao
            })
        });
        listarTodos();

    } catch (error){
        console.log(error);
    }
}

function abrirModalConcluir(pk, fields){
    const fornConcluir = document.querySelector('#form-modal-concluir');
    fornConcluir.setAttribute('onsubmit', `concluirTodo(event, ${pk})`);
    
    const titulo = document.querySelector('#modalTodoConcluir #titulo');
    const descricao = document.querySelector('#modalTodoConcluir #descricao');
    titulo.textContent = fields.titulo;
    descricao.textContent = fields.descricao;
    new bootstrap.Modal('#modalTodoConcluir').show();
}

async function editarTodo(event, pk){
    event.preventDefault();
    const titulo = document.querySelector('#form-modal-editar #titulo').value;
    const descricao = document.querySelector('#form-modal-editar #descricao').value;
    const data_entrega = document.querySelector('#form-modal-editar #data_entrega').value;

    try {
        const response = await fetch(`/todo/${pk}`,{
            method:'PUT',
            headers:headers,
            body: JSON.stringify({
                'titulo':titulo,
                'descricao':descricao,
                'data_entrega':data_entrega
            })
        });
        listarTodos();
    } catch (error){
        console.error(error);
    }
}

function abrirModalEditar(pk, fields){
    const fornEditar = document.querySelector('#form-modal-editar');
    fornEditar.setAttribute('onsubmit', `editarTodo(event, ${pk})`);

    const titulo = document.querySelector('#form-modal-editar #titulo');
    const descricao = document.querySelector('#form-modal-editar #descricao');
    const data_entrega = document.querySelector('#form-modal-editar #data_entrega');
    console.log(descricao);
    titulo.value = fields.titulo;
    descricao.textContent = fields.descricao;
    console.log(descricao);
    data_entrega.value = new Date(fields.data_entrega).toISOString().split('T')[0];
    new bootstrap.Modal('#modalTodoEditar').show();
}


window.addEventListener('load',listarTodos)

