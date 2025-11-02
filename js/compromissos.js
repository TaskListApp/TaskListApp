function inicializarCompromissos() {
  let contador = 0;

  const lista = document.getElementById("listaCompromissos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const inputComp = document.getElementById("novoCompromisso");
  const inputData = document.getElementById("dataCompromisso");
  const inputHora = document.getElementById("horaCompromisso");
  const btnLimpar = document.getElementById("btnLimpar");
  const btnSelecionarTudo = document.getElementById("btnSelecionarTudo");

  const divAlerta = document.createElement("div");
  divAlerta.className = "mt-2";
  lista.parentNode.insertBefore(divAlerta, lista);

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  inputData.placeholder = `${dia}/${mes}/${ano}`;

  const hora = hoje.getHours();
  const minutos = hoje.getMinutes();
  const arredondado = minutos < 30 ? "00" : "30";
  inputHora.placeholder = `${String(hora).padStart(2,'0')}:${arredondado}`;

  btnAdicionar.addEventListener("click", adicionarCompromisso);
  btnLimpar.addEventListener("click", limparCompromissos);
  btnSelecionarTudo.addEventListener("click", selecionarTodos);

  carregarCompromissos();

  function mostrarAlerta(msg, tipo = "info") {
    divAlerta.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show text-center" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>`;
    setTimeout(() => {
      const alerta = divAlerta.querySelector(".alert");
      if (alerta) alerta.remove();
    }, 3000);
  }

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarDataInversa(dataStr) {
    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  function adicionarCompromisso() {
    const texto = inputComp.value.trim();
    const data = inputData.value;
    const hora = inputHora.value;

    if (!texto || !data || !hora) {
      return mostrarAlerta("Preencha todos os campos!", "warning");
    }

    contador++;
    const comp = { id: contador, texto, data, hora, selecionado: false };
    adicionarCompromissoNaLista(comp);
    salvarCompromissos();

    inputComp.value = "";
    inputData.value = "";
    inputHora.value = "";
    inputComp.focus();
  }

  function adicionarCompromissoNaLista(comp) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.dataset.id = comp.id;

    const esquerda = document.createElement("div");
    esquerda.className = "d-flex align-items-center compromisso-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = comp.selecionado;
    checkbox.className = "form-check-input me-2";
    checkbox.addEventListener("change", () => {
      comp.selecionado = checkbox.checked;
      salvarCompromissos();
      atualizarBotoes();
    });

    const spanTexto = document.createElement("span");
    spanTexto.textContent = `${comp.texto} - ${formatarData(comp.data)} ${comp.hora}`;

    esquerda.appendChild(checkbox);
    esquerda.appendChild(spanTexto);

    const direita = document.createElement("div");
    direita.className = "d-flex align-items-center";

    const iconeUp = document.createElement("i");
    iconeUp.className = "bi bi-arrow-up-circle-fill text-success me-2 icone-mover";
    iconeUp.style.cursor = "pointer";
    iconeUp.addEventListener("click", () => {
      const ant = li.previousElementSibling;
      if (ant) lista.insertBefore(li, ant);
      salvarCompromissos();
    });

    const iconeDown = document.createElement("i");
    iconeDown.className = "bi bi-arrow-down-circle-fill text-primary me-2 icone-mover";
    iconeDown.style.cursor = "pointer";
    iconeDown.addEventListener("click", () => {
      const prox = li.nextElementSibling;
      if (prox) lista.insertBefore(prox, li.nextSibling);
      salvarCompromissos();
    });

    const iconeExcluir = document.createElement("i");
    iconeExcluir.className = "bi bi-trash3-fill text-danger";
    iconeExcluir.style.cursor = "pointer";
    iconeExcluir.addEventListener("click", () => {
      li.remove();
      renumerar();
      salvarCompromissos();
    });

    direita.appendChild(iconeUp);
    direita.appendChild(iconeDown);
    direita.appendChild(iconeExcluir);

    li.appendChild(esquerda);
    li.appendChild(direita);
    lista.appendChild(li);

    renumerar();
    atualizarBotoes();
  }

  function renumerar() {
    let num = 1;
    lista.querySelectorAll("li").forEach(li => li.dataset.id = num++);
    contador = num - 1;
  }

  function salvarCompromissos() {
    const comps = [];
    lista.querySelectorAll("li").forEach(li => {
      const checkbox = li.querySelector("input[type=checkbox]");
      const [texto, dataHora] = li.querySelector("span").textContent.split(" - ");
      const [data, hora] = dataHora.split(" ");
      comps.push({
        id: parseInt(li.dataset.id),
        texto,
        data: formatarDataInversa(data),
        hora,
        selecionado: checkbox.checked
      });
    });
    localStorage.setItem("compromissos", JSON.stringify(comps));
    atualizarBotoes();
  }

  function carregarCompromissos() {
    const armazenados = JSON.parse(localStorage.getItem("compromissos")) || [];
    lista.innerHTML = "";
    armazenados.forEach(c => adicionarCompromissoNaLista(c));
    renumerar();
    atualizarBotoes();
  }

  function limparCompromissos() {
    if (confirm("Tem certeza que deseja limpar todos os compromissos?")) {
      lista.innerHTML = "";
      localStorage.removeItem("compromissos");
      contador = 0;
      atualizarBotoes();
    }
  }

  function selecionarTodos() {
    const todos = lista.querySelectorAll("input[type=checkbox]");
    if (todos.length === 0) {
      mostrarAlerta("Nenhum compromisso para selecionar!", "info");
      return;
    }

    const marcar = Array.from(todos).some(cb => !cb.checked);
    todos.forEach(cb => cb.checked = marcar);
    salvarCompromissos();
  }

  function atualizarBotoes() {
    const todos = lista.querySelectorAll("input[type=checkbox]");
    const todosSelecionados = todos.length > 0 && Array.from(todos).every(cb => cb.checked);

    btnLimpar.style.display = todosSelecionados ? "inline-block" : "none";

    if (todos.length === 0) {
      btnSelecionarTudo.innerHTML = '<i class="bi bi-check2-square"></i> Selecionar';
      btnSelecionarTudo.disabled = true;
    } else {
      btnSelecionarTudo.disabled = false;
      if (todosSelecionados) {
        btnSelecionarTudo.innerHTML = '<i class="bi bi-x-square"></i> Desmarcar';
      } else {
        btnSelecionarTudo.innerHTML = '<i class="bi bi-check2-square"></i> Selecionar';
      }
    }
  }
}
