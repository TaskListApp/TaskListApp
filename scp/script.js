// Variáveis e constantes
let contador = 0;
const btnAdicionar = document.getElementById("btnAdicionar");
const inputTarefa = document.getElementById("novaTarefa");
const lista = document.getElementById("listaTarefas");

// Carrega as tarefas salvas
window.addEventListener("DOMContentLoaded", carregarTarefas);
btnAdicionar.addEventListener("click", adicionarTarefa);

// Adiciona uma nova tarefa
function adicionarTarefa() {
    const texto = inputTarefa.value.trim();
    if (texto === "") return;

    contador++;

    const tarefa = {
        id: contador,
        texto: texto,
        ativo: false
    };

    adicionarTarefaNaLista(tarefa);
    salvarTarefas();

    inputTarefa.value = "";
    inputTarefa.focus();
}

// Adiciona tarefa na lista
function adicionarTarefaNaLista(tarefa) {
    const item = document.createElement("li");
    item.className = "list-group-item" + (tarefa.ativo ? " active" : "");
    item.innerHTML = `
        <span>${tarefa.id}. ${tarefa.texto}</span>
        <i class="bi bi-check-circle text-success selecionar" style="cursor:pointer;"></i>
    `;

    lista.appendChild(item);

    // Seleciona a tarefa
    item.querySelector(".selecionar").addEventListener("click", () => {
        item.classList.toggle("active");
        tarefa.ativo = item.classList.contains("active");
        salvarTarefas();
    });
}

// Salva as tarefas
function salvarTarefas() {
    const tarefas = [];
    document.querySelectorAll("#listaTarefas li").forEach((item) => {
        const textoCompleto = item.querySelector("span").textContent;
        const [num, ...resto] = textoCompleto.split(".");
        const texto = resto.join(".").trim();
        tarefas.push({
            id: parseInt(num),
            texto: texto,
            ativo: item.classList.contains("active")
        });
    });

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Carrega as tarefas
function carregarTarefas() {
    const armazenadas = JSON.parse(localStorage.getItem("tarefas")) || [];
    lista.innerHTML = "";
    armazenadas.forEach((t) => {
        if (t.id > contador) contador = t.id;
        adicionarTarefaNaLista(t);
    });
}
