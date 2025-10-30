document.addEventListener("DOMContentLoaded", () => {
  fetch("./menu.html")
    .then(resp => {
      if (!resp.ok) throw new Error("Falha ao carregar o menu");
      return resp.text();
    })
    .then(html => {
      document.getElementById("menu-container").innerHTML = html;
    })
    .catch(err => console.error("Erro ao carregar o menu:", err));

  fetch("./pages/tarefas.html")
    .then(resp => {
      if (!resp.ok) throw new Error("Falha ao carregar tarefas");
      return resp.text();
    })
    .then(html => {
      document.getElementById("conteudo").innerHTML = html;
      inicializarTarefas();
    })
    .catch(err => console.error("Erro ao carregar tarefas:", err));
});

function inicializarTarefas() {
  let contador = 0;
  const btnAdicionar = document.getElementById("btnAdicionar");
  const inputTarefa = document.getElementById("novaTarefa");
  const lista = document.getElementById("listaTarefas");
  const titulo = document.querySelector("h2");

  if (!btnAdicionar || !inputTarefa || !lista || !titulo) {
    console.error("Elementos da lista de tarefas não encontrados!");
    return;
  }

    const iconeSelecionar = document.createElement("i");
  iconeSelecionar.className = "bi bi-check2-square ms-2 text-primary";
  iconeSelecionar.style.cursor = "pointer";
  iconeSelecionar.title = "Selecionar todas as tarefas";
  titulo.appendChild(iconeSelecionar);

const btnLimpar = document.createElement("button");
btnLimpar.id = "btnLimpar";
btnLimpar.className = "btn btn-warning btn-sm mt-3";
btnLimpar.innerHTML = '<i class="bi bi-eraser-fill" style="color:#0d1b2a;"></i> <span style="color:#0d1b2a;">Limpar</span>';
btnLimpar.style.display = "none";
btnLimpar.style.margin = "20px auto 0"; 
btnLimpar.style.display = "block"; 
lista.parentNode.appendChild(btnLimpar);

  const divAlerta = document.createElement("div");
  divAlerta.className = "mt-3";
  inputTarefa.parentNode.parentNode.insertBefore(divAlerta, lista);

  btnAdicionar.addEventListener("click", adicionarTarefa);
  btnLimpar.addEventListener("click", limparTarefasSelecionadas);
  iconeSelecionar.addEventListener("click", selecionarTodas);

  carregarTarefas();

  function adicionarTarefa() {
    const texto = inputTarefa.value.trim();
    if (texto === "") {
      mostrarAlerta("Digite uma tarefa antes de adicionar!", "warning");
      return;
    }

    contador++;
    const tarefa = { id: contador, texto: texto, concluida: false };
    adicionarTarefaNaLista(tarefa);
    salvarTarefas();

    inputTarefa.value = "";
    inputTarefa.focus();
    atualizarVisibilidadeBotaoLimpar();
  }

  function adicionarTarefaNaLista(tarefa) {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex align-items-center justify-content-between";

    const esquerda = document.createElement("div");
    esquerda.className = "d-flex align-items-center";

    const icone = document.createElement("i");
    icone.className =
      "icone-status bi " +
      (tarefa.concluida ? "bi-check-circle-fill text-success" : "bi-circle text-secondary");

    const span = document.createElement("span");
    span.className =
      "ms-2 tarefa-texto" + (tarefa.concluida ? " tarefa-concluida" : "");
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
    iconeExcluir.style.cursor = "pointer";

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
      atualizarVisibilidadeBotaoLimpar();
    });

    iconeExcluir.addEventListener("click", () => {
      item.remove();
      renumerarTarefas();
      salvarTarefas();
      atualizarVisibilidadeBotaoLimpar();
    });

    iconeUp.addEventListener("click", () => {
      const anterior = item.previousElementSibling;
      if (anterior) lista.insertBefore(item, anterior);
      renumerarTarefas();
      salvarTarefas();
    });

    iconeDown.addEventListener("click", () => {
      const proximo = item.nextElementSibling;
      if (proximo) lista.insertBefore(proximo, item.nextSibling);
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

  function selecionarTodas() {
    const itens = document.querySelectorAll("#listaTarefas li");
    if (itens.length === 0) {
      mostrarAlerta("Nenhuma tarefa para selecionar!", "info");
      return;
    }

    let todasConcluidas = true;
    itens.forEach(item => {
      const icone = item.querySelector(".icone-status");
      const span = item.querySelector(".tarefa-texto");
      if (!span.classList.contains("tarefa-concluida")) todasConcluidas = false;
    });

    const marcar = !todasConcluidas;
    itens.forEach(item => {
      const icone = item.querySelector(".icone-status");
      const span = item.querySelector(".tarefa-texto");
      if (marcar) {
        icone.className = "icone-status bi bi-check-circle-fill text-success";
        span.classList.add("tarefa-concluida");
      } else {
        icone.className = "icone-status bi bi-circle text-secondary";
        span.classList.remove("tarefa-concluida");
      }
    });

    salvarTarefas();
    atualizarVisibilidadeBotaoLimpar();
  }

  function limparTarefasSelecionadas() {
    if (confirm("Tem certeza que deseja limpar todas as tarefas selecionadas?")) {
      lista.innerHTML = "";
      localStorage.removeItem("tarefas");
      contador = 0;
      atualizarVisibilidadeBotaoLimpar();
    }
  }

  function atualizarVisibilidadeBotaoLimpar() {
    const tarefas = document.querySelectorAll("#listaTarefas li");
    if (tarefas.length === 0) {
      btnLimpar.style.display = "none";
      return;
    }

    const todasSelecionadas = Array.from(tarefas).every(item =>
      item.querySelector(".tarefa-texto").classList.contains("tarefa-concluida")
    );

    btnLimpar.style.display = todasSelecionadas ? "block" : "none";
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
        concluida: concluida,
      });
    });

    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    atualizarVisibilidadeBotaoLimpar();
  }

  function carregarTarefas() {
    const armazenadas = JSON.parse(localStorage.getItem("tarefas")) || [];
    lista.innerHTML = "";
    armazenadas.forEach((t) => adicionarTarefaNaLista(t));
    renumerarTarefas();
    atualizarVisibilidadeBotaoLimpar();
  }
}
