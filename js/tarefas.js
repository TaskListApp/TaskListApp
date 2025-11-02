function inicializarTarefas() {
  let contador = 0;
  const inputTarefa = document.getElementById("novaTarefa");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const lista = document.getElementById("listaTarefas");

  if (!btnAdicionar || !inputTarefa || !lista) {
    console.error("Elementos da lista de tarefas não encontrados!");
    return;
  }

  const divAlerta = document.createElement("div");
  divAlerta.className = "mt-3";
  inputTarefa.parentNode.parentNode.insertBefore(divAlerta, lista);

  const divBotoes = document.createElement("div");
  divBotoes.className = "d-flex justify-content-center align-items-center gap-3 mt-3";

  // Selecionar Tudo
  const btnSelecionarTudo = document.createElement("button");
  btnSelecionarTudo.id = "btnSelecionarTudo";
  btnSelecionarTudo.className = "btn btn-primary btn-sm";
  btnSelecionarTudo.innerHTML = '<i class="bi bi-check2-square"></i> Selecionar Tudo';

  // Limpar
  const btnLimpar = document.createElement("button");
  btnLimpar.id = "btnLimpar";
  btnLimpar.className = "btn btn-warning btn-sm";
  btnLimpar.innerHTML = '<i class="bi bi-eraser-fill" style="color:#0d1b2a;"></i> <span style="color:#0d1b2a;">Limpar</span>';
  btnLimpar.style.display = "none";

  divBotoes.appendChild(btnSelecionarTudo);
  divBotoes.appendChild(btnLimpar);
  lista.parentNode.appendChild(divBotoes);

  btnAdicionar.addEventListener("click", adicionarTarefa);
  btnSelecionarTudo.addEventListener("click", selecionarTodas);
  btnLimpar.addEventListener("click", limparTarefasSelecionadas);

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
    iconeExcluir.style.cursor = "pointer";

    direita.appendChild(iconeUp);
    direita.appendChild(iconeDown);
    direita.appendChild(iconeExcluir);

    item.appendChild(esquerda);
    item.appendChild(direita);
    lista.appendChild(item);

    icone.addEventListener("click", () => {
      tarefa.concluida = !tarefa.concluida;
      atualizarIconeTarefa(icone, span, tarefa.concluida);
      salvarTarefas();
      atualizarVisibilidadeBotaoLimpar();
      atualizarTextoBotaoSelecionar();
    });

    iconeExcluir.addEventListener("click", () => {
      item.remove();
      renumerarTarefas();
      salvarTarefas();
      atualizarVisibilidadeBotaoLimpar();
      atualizarTextoBotaoSelecionar();
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

  function atualizarIconeTarefa(icone, span, concluida) {
    if (concluida) {
      icone.className = "icone-status bi bi-check-circle-fill text-success";
      span.classList.add("tarefa-concluida");
    } else {
      icone.className = "icone-status bi bi-circle text-secondary";
      span.classList.remove("tarefa-concluida");
    }
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

    let todasConcluidas = Array.from(itens).every(item =>
      item.querySelector(".tarefa-texto").classList.contains("tarefa-concluida")
    );

    const marcar = !todasConcluidas;
    itens.forEach(item => {
      const icone = item.querySelector(".icone-status");
      const span = item.querySelector(".tarefa-texto");
      atualizarIconeTarefa(icone, span, marcar);
    });

    atualizarTextoBotaoSelecionar();

    salvarTarefas();
    atualizarVisibilidadeBotaoLimpar();
  }

  function atualizarTextoBotaoSelecionar() {
    const todasSelecionadas = Array.from(document.querySelectorAll("#listaTarefas li")).every(item =>
      item.querySelector(".tarefa-texto").classList.contains("tarefa-concluida")
    );

    btnSelecionarTudo.innerHTML = todasSelecionadas
      ? '<i class="bi bi-x-square"></i> Desmarcar Tudo'
      : '<i class="bi bi-check2-square"></i> Selecionar Tudo';
  }

  function limparTarefasSelecionadas() {
    if (confirm("Tem certeza que deseja limpar todas as tarefas selecionadas?")) {
      const itens = document.querySelectorAll("#listaTarefas li");
      itens.forEach(item => {
        const span = item.querySelector(".tarefa-texto");
        if (span.classList.contains("tarefa-concluida")) item.remove();
      });
      renumerarTarefas();
      salvarTarefas();
      atualizarVisibilidadeBotaoLimpar();
      atualizarTextoBotaoSelecionar();
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
      tarefas.push({ id: parseInt(num), texto, concluida });
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }

  function carregarTarefas() {
    const armazenadas = JSON.parse(localStorage.getItem("tarefas")) || [];
    lista.innerHTML = "";
    armazenadas.forEach((t) => adicionarTarefaNaLista(t));
    renumerarTarefas();
    atualizarVisibilidadeBotaoLimpar();
    atualizarTextoBotaoSelecionar();
  }
}
