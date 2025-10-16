let contador = 0;
const btnAdicionar = document.getElementById("btnAdicionar");
const inputTarefa = document.getElementById("novaTarefa");
const lista = document.getElementById("listaTarefas");

const btnExcluirTodas = document.createElement("button");
btnExcluirTodas.className = "btn btn-danger mt-3";
btnExcluirTodas.innerHTML = '<i class="bi bi-trash3"></i> Excluir Todas';
btnExcluirTodas.style.display = "none";
btnExcluirTodas.style.width = "20%";          // 1/5 da largura
btnExcluirTodas.style.margin = "20px auto 0"; // centralizado
lista.parentNode.appendChild(btnExcluirTodas); // abaixo da lista

const divAlerta = document.createElement("div");
divAlerta.className = "mt-3";
inputTarefa.parentNode.parentNode.insertBefore(divAlerta, lista);

window.addEventListener("DOMContentLoaded", carregarTarefas);
btnAdicionar.addEventListener("click", adicionarTarefa);
btnExcluirTodas.addEventListener("click", excluirTodasTarefas);

function adicionarTarefa() {
    const texto = inputTarefa.value.trim();

    if (texto === "") {
        mostrarAlerta("Digite uma tarefa antes de adicionar!", "warning");
        return;
    }

    contador++;

    const tarefa = {
        id: contador,
        texto: texto,
        concluida: false
    };

    adicionarTarefaNaLista(tarefa);
    salvarTarefas();

    inputTarefa.value = "";
    inputTarefa.focus();
    atualizarVisibilidadeBotaoExcluirTodas();
}

function adicionarTarefaNaLista(tarefa) {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex align-items-center justify-content-between";

    const esquerda = document.createElement("div");
    esquerda.className = "d-flex align-items-center";

    const icone = document.createElement("i");
    icone.className = "icone-status bi " +
        (tarefa.concluida ? "bi-check-circle-fill text-success" : "bi-circle text-secondary");

    const span = document.createElement("span");
    span.className = "ms-2 tarefa-texto" + (tarefa.concluida ? " tarefa-concluida" : "");
    span.textContent = `${tarefa.id}. ${tarefa.texto}`;

    esquerda.appendChild(icone);
    esquerda.appendChild(span);

    const direita = document.createElement("div");
    direita.className = "d-flex align-items-center";

    const iconeUp = document.createElement("i");
    iconeUp.className = "bi bi-arrow-up-circle-fill text-success me-2 icone-mover";
    iconeUp.style.cursor = "pointer";

    const iconeDown = document.createElement("i");
    iconeDown.className = "bi bi-arrow-down-circle-fill text-primary me-2 icone-mover";
    iconeDown.style.cursor = "pointer";

    const iconeExcluir = document.createElement("i");
    iconeExcluir.className = "icone-excluir bi bi-trash3-fill";

    direita.appendChild(iconeUp);
    direita.appendChild(iconeDown);
    direita.appendChild(iconeExcluir);

    item.appendChild(esquerda);
    item.appendChild(direita);
    lista.appendChild(item);

    icone.addEventListener("click", () => {
        tarefa.concluida = !tarefa.concluida;

        if (tarefa.concluida) {
            icone.className = "icone-status bi bi-check-circle-fill text-success";
            span.classList.add("tarefa-concluida");
        } else {
            icone.className = "icone-status bi bi-circle text-secondary";
            span.classList.remove("tarefa-concluida");
        }

        salvarTarefas();
    });

    iconeExcluir.addEventListener("click", () => {
        item.remove();
        renumerarTarefas();
        salvarTarefas();
        atualizarVisibilidadeBotaoExcluirTodas();
    });

    iconeUp.addEventListener("click", () => {
        const anterior = item.previousElementSibling;
        if (anterior) lista.insertBefore(item, anterior);
        renumerarTarefas();
        salvarTarefas();
    });

    iconeDown.addEventListener("click", () => {
        const proximo = item.nextElementSibling;
        if (proximo) lista.insertBefore(proximo, item);
        renumerarTarefas();
        salvarTarefas();
    });
}

function renumerarTarefas() {
    let novaContagem = 1;
    document.querySelectorAll("#listaTarefas li .tarefa-texto").forEach((span) => {
        const textoCompleto = span.textContent;
        const [, ...resto] = textoCompleto.split(".");
        const texto = resto.join(".").trim();
        span.textContent = `${novaContagem}. ${texto}`;
        novaContagem++;
    });
    contador = novaContagem - 1;
}

function excluirTodasTarefas() {
    if (confirm("Tem certeza que deseja excluir todas as tarefas?")) {
        lista.innerHTML = "";
        localStorage.removeItem("tarefas");
        contador = 0;
        atualizarVisibilidadeBotaoExcluirTodas();
    }
}

function atualizarVisibilidadeBotaoExcluirTodas() {
    const temTarefas = lista.children.length > 0;
    btnExcluirTodas.style.display = temTarefas ? "block" : "none";
}

function mostrarAlerta(mensagem, tipo = "info") {
    divAlerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show text-center" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
    setTimeout(() => {
        const alerta = divAlerta.querySelector(".alert");
        if (alerta) alerta.remove();
    }, 3000);
}

function salvarTarefas() {
    const tarefas = [];
    document.querySelectorAll("#listaTarefas li").forEach((item) => {
        const span = item.querySelector(".tarefa-texto");
        const textoCompleto = span.textContent;
        const [num, ...resto] = textoCompleto.split(".");
        const texto = resto.join(".").trim();
        const concluida = span.classList.contains("tarefa-concluida");

        tarefas.push({
            id: parseInt(num),
            texto: texto,
            concluida: concluida
        });
    });

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    atualizarVisibilidadeBotaoExcluirTodas();
}

function carregarTarefas() {
    const armazenadas = JSON.parse(localStorage.getItem("tarefas")) || [];
    lista.innerHTML = "";
    armazenadas.forEach((t) => adicionarTarefaNaLista(t));
    renumerarTarefas();
    atualizarVisibilidadeBotaoExcluirTodas();
}
