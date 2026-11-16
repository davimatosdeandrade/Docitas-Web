const CHAVE_PRODUTOS = "docitas_produtos";

let dadosUsuario = localStorage.getItem("docitas_usuario_logado");
let usuarioAtivo = dadosUsuario ? JSON.parse(dadosUsuario) : null;

function obterProdutos() {
  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  if (dados) {
    return JSON.parse(dados);
  }
  return [];
}

function sincronizarCarrinho() {
  if (!usuarioAtivo || usuarioAtivo.tipo === "admin") {
    return [];
  }

  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  let dadosCarrinho = localStorage.getItem(chaveCarrinho);
  if (!dadosCarrinho) {
    return [];
  }

  let carrinho = JSON.parse(dadosCarrinho);
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
    localStorage.setItem(chaveCarrinho, JSON.stringify(carrinhoValido));
  }

  return carrinhoValido;
}

function carregarCarrinho() {
  let elVazio = document.getElementById("carrinho-vazio");
  let elConteudo = document.getElementById("carrinho-conteudo");
  let corpoTabela = document.getElementById("carrinho-tabela-corpo");
  let elQtd = document.getElementById("resumo-quantidade");
  let elTotal = document.getElementById("resumo-total");
  let elBadge = document.getElementById("cart-count");

  if (!usuarioAtivo) {
    if (elBadge) elBadge.innerText = "0";
    if (elConteudo) elConteudo.style.display = "none";
    if (elVazio) {
      elVazio.style.display = "block";
      elVazio.innerHTML = `
        <div class="sem-produtos-box">
          <h3>Você não está conectado</h3>
          <p>Faça login ou crie uma conta para começar a adicionar doces e gerenciar sua sacola de compras.</p>
        </div>
      `;
    }
    return;
  }

  if (usuarioAtivo.tipo === "admin") {
    if (elBadge) elBadge.innerText = "0";
    if (elConteudo) elConteudo.style.display = "none";
    if (elVazio) {
      elVazio.style.display = "block";
      elVazio.innerHTML = `
        <div class="sem-produtos-box">
          <h3>Acesso de Administrador</h3>
          <p>Como administrador, você gerencia os produtos e não utiliza o carrinho de compras.</p>
        </div>
      `;
    }
    return;
  }

  if (elVazio) elVazio.style.display = "none";
  if (elConteudo) elConteudo.style.display = "block";

  let carrinho = sincronizarCarrinho();
  let produtos = obterProdutos();

  let totalQtd = 0;
  let totalValor = 0;

  for (let i = 0; i < carrinho.length; i++) {
    totalQtd += carrinho[i].quantidade;
  }
  if (elBadge) {
    elBadge.innerText = totalQtd;
  }

  if (carrinho.length === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px 16px; color: #6B3F2A; font-size: 15px;">
          Nenhum item adicionado ainda.
        </td>
      </tr>
    `;
    if (elQtd) elQtd.innerText = "0";
    if (elTotal) elTotal.innerText = "R$ 0,00";
    return;
  }

  corpoTabela.innerHTML = "";

  for (let i = 0; i < carrinho.length; i++) {
    let item = carrinho[i];
    let produto = null;

    for (let j = 0; j < produtos.length; j++) {
      if (produtos[j].id === item.idProduto) {
        produto = produtos[j];
        break;
      }
    }

    if (!produto) continue;

    let subtotal = produto.preco * item.quantidade;
    totalValor += subtotal;

    let precoFormatado = Number(produto.preco).toFixed(2).replace(".", ",");
    let subtotalFormatado = Number(subtotal).toFixed(2).replace(".", ",");
    let imagemSrc = produto.imagem;

    corpoTabela.innerHTML += `
      <tr>
        <td>
          <img src="${imagemSrc}" alt="${produto.nome}" class="table-img">
        </td>
        <td title="${produto.nome}"><strong>${produto.nome}</strong></td>
        <td>R$ ${precoFormatado}</td>
        <td>
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="alterarQuantidade(${produto.id}, -1)">-</button>
            <span class="qty-val">${item.quantidade}</span>
            <button type="button" class="qty-btn" onclick="alterarQuantidade(${produto.id}, 1)">+</button>
          </div>
        </td>
        <td><strong>R$ ${subtotalFormatado}</strong></td>
        <td>
          <button type="button" class="btn-danger btn-sm" onclick="removerItem(${produto.id})">Remover</button>
        </td>
      </tr>
    `;
  }

  if (elQtd) elQtd.innerText = totalQtd;
  if (elTotal) elTotal.innerText = "R$ " + totalValor.toFixed(2).replace(".", ",");
}

function alterarQuantidade(idProduto, delta) {
  if (!usuarioAtivo || usuarioAtivo.tipo === "admin") return;
  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  let carrinho = sincronizarCarrinho();

  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].idProduto === idProduto) {
      carrinho[i].quantidade += delta;
      if (carrinho[i].quantidade <= 0) {
        carrinho.splice(i, 1);
      }
      break;
    }
  }

  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
  carregarCarrinho();
}

function removerItem(idProduto) {
  if (!usuarioAtivo || usuarioAtivo.tipo === "admin") return;
  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  let carrinho = sincronizarCarrinho();

  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].idProduto === idProduto) {
      carrinho.splice(i, 1);
      break;
    }
  }

  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
  carregarCarrinho();
}

function esvaziarCarrinho() {
  if (!usuarioAtivo || usuarioAtivo.tipo === "admin") return;
  if (!confirm("Tem certeza que deseja esvaziar o carrinho?")) {
    return;
  }

  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  localStorage.removeItem(chaveCarrinho);
  carregarCarrinho();
}

function finalizarCompra() {
  if (!usuarioAtivo || usuarioAtivo.tipo === "admin") {
    alert("Você precisa estar conectado como cliente para finalizar a compra!");
    window.location.href = "login.html";
    return;
  }

  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  let carrinho = sincronizarCarrinho();

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  localStorage.removeItem(chaveCarrinho);
  carregarCarrinho();
}

carregarCarrinho();
