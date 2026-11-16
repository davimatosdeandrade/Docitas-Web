const CHAVE_PRODUTOS = "docitas_produtos";

function obterProdutos() {
  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  if (dados) {
    return JSON.parse(dados);
  }
  return [];
}

function salvarProdutos(listaProdutos) {
  localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(listaProdutos));
}

function obterUsuarioLogado() {
  let dados = localStorage.getItem("docitas_usuario_logado");
  if (dados) {
    return JSON.parse(dados);
  }
  return null;
}

function sincronizarCarrinho() {
  let usuario = obterUsuarioLogado();
  if (!usuario || usuario.tipo === "admin") {
    return [];
  }

  let dados = localStorage.getItem("docitas_carrinho_" + usuario.id);
  if (!dados) {
    return [];
  }

  let carrinho = JSON.parse(dados);
  let produtos = obterProdutos();
  let carrinhoValido = [];
  let alterou = false;

  for (let i = 0; i < carrinho.length; i++) {
    let existe = false;
    for (let j = 0; j < produtos.length; j++) {
      if (produtos[j].id === carrinho[i].idProduto) {
        existe = true;
        break;
      }
    }

    if (existe) {
      carrinhoValido.push(carrinho[i]);
    } else {
      alterou = true;
    }
  }

  if (alterou) {
    localStorage.setItem("docitas_carrinho_" + usuario.id, JSON.stringify(carrinhoValido));
  }

  return carrinhoValido;
}

function salvarCarrinho(carrinho) {
  let usuario = obterUsuarioLogado();
  if (!usuario) return;

  localStorage.setItem("docitas_carrinho_" + usuario.id, JSON.stringify(carrinho));
}

function limparCarrinho() {
  let usuario = obterUsuarioLogado();
  if (!usuario) return;

  localStorage.removeItem("docitas_carrinho_" + usuario.id);
  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  let elementoContador = document.getElementById("cart-count");
  if (!elementoContador) return;

  let carrinho = sincronizarCarrinho();
  let total = 0;

  for (let i = 0; i < carrinho.length; i++) {
    total += carrinho[i].quantidade;
  }

  elementoContador.innerHTML = total;
}

function adicionarAoCarrinho(idProduto) {
  let usuario = obterUsuarioLogado();
  if (!usuario) {
    alert("Você precisa entrar na sua conta ou criar uma conta para adicionar produtos ao carrinho!");
    window.location.href = "login.html";
    return;
  }

  if (usuario.tipo === "admin") {
    alert("Administradores não podem adicionar itens ao carrinho!");
    return;
  }

  let carrinho = sincronizarCarrinho();
  let itemJaExiste = false;

  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].idProduto === idProduto) {
      carrinho[i].quantidade += 1;
      itemJaExiste = true;
      break;
    }
  }

  if (!itemJaExiste) {
    carrinho.push({
      idProduto: idProduto,
      quantidade: 1,
      usuarioId: usuario.id
    });
  }

  salvarCarrinho(carrinho);
  atualizarContadorCarrinho();
}

function mostrarProdutos() {
  let grid = document.getElementById("products-grid");
  if (!grid) return;

  let produtos = obterProdutos();
  grid.innerHTML = "";

  if (produtos.length === 0) {
    grid.innerHTML = `
      <div class="sem-produtos-box">
        <h3>Nenhum doce cadastrado no momento</h3>
        <p>Aguardando o Administrador cadastrar os primeiros produtos na plataforma.</p>
      </div>
    `;
    return;
  }

  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];
    let precoFormatado = Number(p.preco).toFixed(2).replace(".", ",");
    let corFundo = p.cor || "#E9A98B";
    let destaque = p.destaque || "Doce Artesanal";
    let imagemSrc = p.imagem;

    grid.innerHTML += `
      <article class="product-card">
        <div class="card-banner" style="background-color: ${corFundo};">
          <span class="badge-tag">${destaque}</span>
          <img src="${imagemSrc}" alt="${p.nome}" class="product-img">
        </div>
        
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="product-title" title="${p.nome}">${p.nome}</h3>
            <span class="product-price">R$ ${precoFormatado}</span>
          </div>
          <p class="product-desc" title="${p.descricao}">${p.descricao}</p>
          
          <div class="card-footer">
            <button type="button" class="add-cart-btn" onclick="adicionarAoCarrinho(${p.id})">
              Adicionar à Sacola
            </button>
          </div>
        </div>
      </article>
    `;
  }
}

mostrarProdutos();
atualizarContadorCarrinho();
