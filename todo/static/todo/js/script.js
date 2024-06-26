const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken
};
const modalNovoTodo = new bootstrap.Modal('#modalNovoTodo');
const modalTodoConcluir = new bootstrap.Modal('#modalTodoConcluir');
const modalTodoEditar = new bootstrap.Modal('#modalTodoEditar');
const modalTodoDelete = new bootstrap.Modal('#modalTodoDelete');

let filtroConcluido = filterListTodo();

function filterListTodo(){
    if(window.location.pathname=='/'){
        return 'True';
    } if (window.location.pathname=='/concluidos/'){
        return 'False';  
    }
}

function limparForm(form){
    const inputs = form.querySelectorAll('input');
    const textAreas = form.querySelectorAll('textarea');

    inputs.forEach (i =>{
        i.value = ''
    })
    textAreas.forEach(i =>{
        i.value = ''
    })
}

function atualizaPaginacao (filtro, num_pages, page){
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; 

    const previousItem = document.createElement('li');
    previousItem.innerHTML = `
        <a class="page-link ${page<=1 ? 'disabled':''}" onclick="listarTodos(${filtro}, ${page-1})" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(previousItem)

    for(let i = 1; i <= num_pages; i++) {
        if (i>=(page-1) && i<=(page+1)) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item';
            pageItem.classList.toggle('active', i==page);
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
    
            pageLink.textContent = i;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                listarTodos(filtro, i);
            });
            pageItem.appendChild(pageLink);
            pagination.appendChild(pageItem);
        }

    }
    const nextItem = document.createElement('li');
    nextItem.innerHTML = `
        <a class="page-link ${page>=num_pages ? 'disabled':''}" onclick="listarTodos(${filtro}, ${page+1})" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextItem);
}


async function getTodos(filtro, page){
    const response = await fetch('/listar-todos/', {
        method:'POST',
        headers:headers,
        body:JSON.stringify({
            data_conclusao:filtro,
            page: page
        })
    });
    const data = await response.json();
    data['data'] = JSON.parse(data['data']);
    return data
}

async function listarTodos(filtro, page){
    const response = await getTodos(filtro, page);

    const tbody = document.querySelector('#lista-todos tbody');
    tbody.textContent = '';
    
    response['data'].forEach(todo => {
        // ... (mesmo código para criar e adicionar as linhas da tabela)
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
    });
    atualizaPaginacao(filtro, response['num_pages'], page)
}

function mostrarAlerta(idAlert){
    const alert = document.querySelector(idAlert);
    alert.style.display ='block';
    alert.style.opacity = 1;
    setTimeout(function (){
        alert.style.transition = 'opacity 0.5s ease-out';
        alert.style.opacity = 0;
        setTimeout(function () {
            alert.style.display = 'none';
        }, 500);
    }, 3000);
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
        listarTodos(filtroConcluido);
        mostrarAlerta('#alertNovo');
        modalNovoTodo.hide();
        limparForm(form);

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
        listarTodos(filtroConcluido);
        mostrarAlerta('#alertDeleta');
        modalTodoDelete.hide();
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
    modalTodoDelete.show();
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
        listarTodos(filtroConcluido);
        limparForm(document.querySelector('#modalTodoConcluir'));
        mostrarAlerta('#alertConcluir');
        modalTodoConcluir.hide();

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
    modalTodoConcluir.show();
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
        listarTodos(filtroConcluido);
        mostrarAlerta('#alertEditar');
        modalTodoEditar.hide();
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
    titulo.value = fields.titulo;
    descricao.value = fields.descricao;
    data_entrega.value = new Date(fields.data_entrega).toISOString().split('T')[0];
    modalTodoEditar.show();
}

window.addEventListener('load',listarTodos(filtroConcluido, 1))
