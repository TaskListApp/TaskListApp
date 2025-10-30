document.addEventListener("DOMContentLoaded", () => {
  // Menu
  fetch("/menu.html")
    .then(resp => resp.ok ? resp.text() : Promise.reject("Falha ao carregar o menu"))
    .then(html => document.getElementById("menu-container").innerHTML = html)
    .catch(err => console.error(err));

  // Página de compras
  fetch("/pages/compras.html")
    .then(resp => resp.ok ? resp.text() : Promise.reject("Falha ao carregar compras"))
    .then(html => {
      const conteudo = document.getElementById("conteudo");
      conteudo.innerHTML = html;

      if (
        document.getElementById("listaCompras") &&
        document.getElementById("btnAdicionar") &&
        document.getElementById("novoProduto") &&
        document.getElementById("precoProduto")
      ) {
        if (!window.comprasInicializadas) {
          inicializarCompras();
          window.comprasInicializadas = true;
        }
      } else {
        console.error("Elementos de compras não encontrados. Verifique pages/compras.html");
      }
    })
    .catch(err => console.error(err));
});

function inicializarCompras() {
  let contador = 0;

  const btnAdicionar = document.getElementById("btnAdicionar");
  const inputProduto = document.getElementById("novoProduto");
  const inputPreco = document.getElementById("precoProduto");
  const lista = document.getElementById("listaCompras");
  const iconeSelecionarTodos = document.getElementById("iconeSelecionarTodos");
  const btnLimparLista = document.getElementById("btnLimparLista");
  const inputValorPago = document.getElementById("inputValorPago");
  const btnCalcular = document.getElementById("btnCalcular");
  const subtotalEl = document.getElementById("subtotal");
  const valorPagoContainer = document.getElementById("valorPagoContainer");
  const trocoContainer = document.getElementById("trocoContainer");
  const valorPagoEl = document.getElementById("valorPago");
  const trocoEl = document.getElementById("troco");
  const divAlerta = document.getElementById("alerta");

  function mostrarAlerta(mensagem, tipo = "info") {
    divAlerta.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show text-center" role="alert">
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>`;
    setTimeout(() => {
      const alerta = divAlerta.querySelector(".alert");
      if (alerta) alerta.remove();
    }, 3000);
  }

  function salvarCompras() {
    const produtos = [];
    document.querySelectorAll("#listaCompras li").forEach(item => {
      const nome = item.querySelector(".produto-nome").textContent;
      const preco = parseFloat(item.querySelector(".produto-preco").value) || 0;
      const selecionado = item.querySelector(".form-check-input").checked;
      produtos.push({ id: parseInt(item.dataset.id), nome, preco, selecionado });
    });
    localStorage.setItem("compras", JSON.stringify(produtos));
    atualizarSubtotal();
    atualizarBotaoLimpar();
  }

  function carregarCompras() {
    const armazenadas = JSON.parse(localStorage.getItem("compras")) || [];
    lista.innerHTML = "";
    armazenadas.forEach(p => adicionarProdutoNaLista(p));
    renumerarProdutos();
    atualizarSubtotal();
    atualizarBotaoLimpar();
  }

  function adicionarProduto() {
    const nome = inputProduto.value.trim();
    let preco = parseFloat(inputPreco.value);
    if (isNaN(preco)) preco = 0;

    if (!nome) {
      mostrarAlerta("Digite o nome do produto!", "warning");
      return;
    }

    contador++;
    const produto = { id: contador, nome, preco, selecionado: false };
    adicionarProdutoNaLista(produto);
    salvarCompras();

    inputProduto.value = "";
    inputPreco.value = "";
    inputProduto.focus();
  }

  function adicionarProdutoNaLista(produto) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.dataset.id = produto.id;

    const esquerda = document.createElement("div");
    esquerda.className = "d-flex align-items-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input me-2";
    checkbox.checked = produto.selecionado;

    const spanNome = document.createElement("span");
    spanNome.className = "produto-nome";
    spanNome.textContent = produto.nome;

    esquerda.appendChild(checkbox);
    esquerda.appendChild(spanNome);

    const direita = document.createElement("div");
    direita.className = "d-flex align-items-center";

    const inputPrecoEl = document.createElement("input");
    inputPrecoEl.type = "number";
    inputPrecoEl.className = "form-control produto-preco me-2";
    inputPrecoEl.value = produto.preco.toFixed(2);
    inputPrecoEl.min = 0;
    inputPrecoEl.step = "0.01";
    inputPrecoEl.style.width = "80px";
    inputPrecoEl.addEventListener("change", () => {
      inputPrecoEl.value = parseFloat(inputPrecoEl.value || 0).toFixed(2);
      salvarCompras();
    });

    const iconeUp = document.createElement("i");
    iconeUp.className = "bi bi-arrow-up-circle-fill text-success me-2 icone-mover";
    iconeUp.style.cursor = "pointer";

    const iconeDown = document.createElement("i");
    iconeDown.className = "bi bi-arrow-down-circle-fill text-primary me-2 icone-mover";
    iconeDown.style.cursor = "pointer";

    const iconeExcluir = document.createElement("i");
    iconeExcluir.className = "bi bi-trash3-fill text-danger";
    iconeExcluir.style.cursor = "pointer";

    direita.appendChild(inputPrecoEl);
    direita.appendChild(iconeUp);
    direita.appendChild(iconeDown);
    direita.appendChild(iconeExcluir);

    li.appendChild(esquerda);
    li.appendChild(direita);
    lista.appendChild(li);

    checkbox.addEventListener("change", salvarCompras);
    iconeExcluir.addEventListener("click", () => {
      li.remove();
      renumerarProdutos();
      salvarCompras();
    });
    iconeUp.addEventListener("click", () => {
      const anterior = li.previousElementSibling;
      if (anterior) lista.insertBefore(li, anterior);
      renumerarProdutos();
      salvarCompras();
    });
    iconeDown.addEventListener("click", () => {
      const proximo = li.nextElementSibling;
      if (proximo) lista.insertBefore(proximo, li);
      renumerarProdutos();
      salvarCompras();
    });
  }

  function renumerarProdutos() {
    let novaContagem = 1;
    document.querySelectorAll("#listaCompras li").forEach(li => {
      li.dataset.id = novaContagem++;
    });
    contador = novaContagem - 1;
  }

  let tudoSelecionado = false;
  iconeSelecionarTodos.addEventListener("click", () => {
    tudoSelecionado = !tudoSelecionado;
    const checkboxes = document.querySelectorAll("#listaCompras li .form-check-input");
    checkboxes.forEach(cb => cb.checked = tudoSelecionado);
    salvarCompras();

    iconeSelecionarTodos.className = tudoSelecionado
      ? "bi bi-x-square icone-selecionar-tudo"
      : "bi bi-check2-square icone-selecionar-tudo";
  });

    function atualizarSubtotal() {
    let subtotal = 0;
    document.querySelectorAll("#listaCompras li").forEach(li => {
      const preco = parseFloat(li.querySelector(".produto-preco").value) || 0;
      subtotal += preco;
    });
    subtotalEl.textContent = subtotal.toFixed(2);
  }

  function atualizarBotaoLimpar() {
    const todosSelecionados = Array.from(document.querySelectorAll("#listaCompras li .form-check-input")).every(cb => cb.checked);
    btnLimparLista.style.display = todosSelecionados && lista.children.length > 0 ? "inline-block" : "none";
  }

  btnAdicionar.addEventListener("click", adicionarProduto);

  btnLimparLista.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todos os produtos?")) {
      lista.innerHTML = "";
      localStorage.removeItem("compras");
      contador = 0;
      atualizarSubtotal();
      atualizarBotaoLimpar();
    }
  });

  inputValorPago.addEventListener("blur", () => {
    let valor = parseFloat(inputValorPago.value);
    if (isNaN(valor)) valor = 0;
    inputValorPago.value = valor.toFixed(2);
  });

  btnCalcular.addEventListener("click", () => {
    const valorPago = parseFloat(inputValorPago.value) || 0;
    const subtotal = parseFloat(subtotalEl.textContent);
    if (valorPago < subtotal) {
      mostrarAlerta("O valor pago deve ser maior ou igual ao subtotal!", "warning");
      return;
    }
    const troco = valorPago - subtotal;
    trocoEl.textContent = troco.toFixed(2);
    inputValorPago.value = valorPago.toFixed(2); // garante duas casas decimais
    trocoContainer.style.display = "flex";
  });

  carregarCompras();
}
