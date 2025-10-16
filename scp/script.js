// Simulando JavaScript dentro de arquivo .java
let contador = 0;
const btnAdicionar = document.getElementById("btnAdicionar");
const inputTarefa = document.getElementById("novaTarefa");
const lista = document.getElementById("listaTarefas");

btnAdicionar.addEventListener("click", adicionarTarefa);

function adicionarTarefa() {
    const texto = inputTarefa.value.trim();
    if (texto === "") return;

    contador++;

    const item = document.createElement("li");
    item.className = "list-group-item";
    item.innerHTML = `
        <span>${contador}. ${texto}</span>
        <i class="bi bi-check-circle text-success selecionar" style="cursor:pointer;"></i>
    `;

    lista.appendChild(item);
    inputTarefa.value = "";
    inputTarefa.focus();

    item.querySelector(".selecionar").addEventListener("click", () => {
        item.classList.toggle("active");
    });
}
