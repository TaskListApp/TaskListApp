document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menu-container");
  const conteudo = document.getElementById("conteudo");

  // Carrega o menu
  fetch("./menu.html")
    .then(res => res.ok ? res.text() : Promise.reject("Falha ao carregar menu"))
    .then(html => {
      menuContainer.innerHTML = html;

      document.getElementById("linkTarefas").addEventListener("click", e => {
        e.preventDefault();
        carregarPagina("tarefas");
      });
      document.getElementById("linkCompras").addEventListener("click", e => {
        e.preventDefault();
        carregarPagina("compras");
      });
      document.getElementById("linkCompromissos").addEventListener("click", e => {
        e.preventDefault();
        carregarPagina("compromissos");
      });

      carregarPagina("tarefas");
    })
    .catch(err => console.error("Erro ao carregar menu:", err));

  function carregarPagina(pagina) {
    conteudo.innerHTML = "";

    const linksExistentes = document.querySelectorAll("link[data-page-css]");
    linksExistentes.forEach(link => link.remove());

    const scriptsExistentes = document.querySelectorAll("script[data-page-js]");
    scriptsExistentes.forEach(script => script.remove());

    fetch(`/pages/${pagina}.html`)
      .then(res => res.ok ? res.text() : Promise.reject(`Falha ao carregar ${pagina}`))
      .then(html => {
        conteudo.innerHTML = html;

        const linkCss = document.createElement("link");
        linkCss.rel = "stylesheet";
        linkCss.href = `./css/${pagina}.css`;
        linkCss.setAttribute("data-page-css", pagina);
        document.head.appendChild(linkCss);

        const script = document.createElement("script");
        script.src = `./js/${pagina}.js`;
        script.setAttribute("data-page-js", pagina);
        script.onload = () => {
          if (pagina === "tarefas") inicializarTarefas();
          if (pagina === "compras") inicializarCompras();
          if (pagina === "compromissos") inicializarCompromissos();
        };
        document.body.appendChild(script);

        atualizarItemAtivo(pagina);
      })
      .catch(err => console.error(err));
  }

  function atualizarItemAtivo(pagina) {
    const links = menuContainer.querySelectorAll(".nav-link");
    links.forEach(link => {
      link.classList.remove("active");
      if (
        (pagina === "tarefas" && link.id === "linkTarefas") ||
        (pagina === "compras" && link.id === "linkCompras") ||
        (pagina === "compromissos" && link.id === "linkCompromissos")
      ) {
        link.classList.add("active");
      }
    });
  }
});
