function acessarConta() {
  let usuario = localStorage.getItem("docitas_usuario_logado");
  if (usuario) {
    window.location.href = "perfil.html";
  } else {
    window.location.href = "login.html";
  }
}

const CHAVE_PRODUTOS = "docitas_produtos";

let dadosUsuario = localStorage.getItem("docitas_usuario_logado");
if (!dadosUsuario) {
  alert("Acesso restrito! Por favor, faça login para acessar esta página.");
  window.location.href = "login.html";
}

let usuarioAtivo = JSON.parse(dadosUsuario);

function carregarPerfil() {
  let elEmail = document.getElementById("user-email");
  let elAvatar = document.getElementById("user-avatar");

  if (elEmail) {
    elEmail.innerText = usuarioAtivo.email;
  }
  if (elAvatar) {
    elAvatar.innerText = usuarioAtivo.email.charAt(0).toUpperCase();
  }

  let badge = document.getElementById("user-badge");
  let secaoAdmin = document.getElementById("secao-admin");
  let secaoCliente = document.getElementById("secao-cliente");

  if (usuarioAtivo.tipo === "admin") {
    badge.innerText = "Administrador";
    badge.className = "profile-badge badge-admin";
    if (elAvatar) {
      elAvatar.classList.add("admin-avatar");
    }

    secaoAdmin.style.display = "block";
    secaoCliente.style.display = "none";

    carregarTabelaProdutos();
  } else {
    badge.innerText = "Cliente";
    badge.className = "profile-badge badge-cliente";

    secaoAdmin.style.display = "none";
    secaoCliente.style.display = "block";
  }

  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  let contador = document.getElementById("cart-count");
  if (!contador) return;

  if (usuarioAtivo.tipo === "admin") {
    contador.innerText = "0";
    return;
  }

  let chaveCarrinho = "docitas_carrinho_" + usuarioAtivo.id;
  let dadosCarrinho = localStorage.getItem(chaveCarrinho);
  let total = 0;

  if (dadosCarrinho) {
    let carrinho = JSON.parse(dadosCarrinho);
    let dadosProdutos = localStorage.getItem(CHAVE_PRODUTOS);
    let produtos = dadosProdutos ? JSON.parse(dadosProdutos) : [];
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
        total += carrinho[i].quantidade;
      } else {
        alterou = true;
      }
    }

    if (alterou) {
      localStorage.setItem(chaveCarrinho, JSON.stringify(carrinhoValido));
    }
  }

  contador.innerText = total;
}

function carregarTabelaProdutos() {
  let corpoTabela = document.getElementById("tabela-produtos-corpo");
  let avisoVazio = document.getElementById("tabela-vazia-aviso");
  if (!corpoTabela) return;

  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  let produtos = dados ? JSON.parse(dados) : [];

  corpoTabela.innerHTML = "";

  if (produtos.length === 0) {
    avisoVazio.style.display = "block";
    return;
  }

  avisoVazio.style.display = "none";

  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];
    let precoFormatado = Number(p.preco).toFixed(2).replace(".", ",");
    let imagemSrc = p.imagem;

    corpoTabela.innerHTML += `
      <tr>
        <td>
          <img src="${imagemSrc}" alt="${p.nome}" class="table-img">
        </td>
        <td title="${p.nome}"><strong>${p.nome}</strong></td>
        <td>R$ ${precoFormatado}</td>
        <td><span class="badge-tag" style="position: static;">${p.destaque}</span></td>
        <td>
          <span class="color-dot" style="background-color: ${p.cor};"></span>
          <code>${p.cor}</code>
        </td>
        <td>
          <button type="button" class="btn-danger btn-sm" onclick="excluirProduto(${p.id})">Excluir</button>
        </td>
      </tr>
    `;
  }
}

function cadastrarProduto(event) {
  event.preventDefault();

  let nome = document.getElementById("prod-nome").value.trim();
  let preco = parseFloat(document.getElementById("prod-preco").value);
  let destaque = document.getElementById("prod-destaque").value;
  let cor = document.getElementById("prod-cor").value;
  let imagem = document.getElementById("prod-imagem").value.trim();
  let descricao = document.getElementById("prod-desc").value.trim();

  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  let produtos = dados ? JSON.parse(dados) : [];

  let novoProduto = {
    id: Date.now(),
    nome: nome,
    preco: preco,
    destaque: destaque,
    cor: cor,
    imagem: imagem,
    descricao: descricao
  };

  produtos.push(novoProduto);
  localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos));

  document.getElementById("form-novo-produto").reset();
  carregarTabelaProdutos();
}

function excluirProduto(idProduto) {
  if (!confirm("Tem certeza que deseja excluir este doce?")) {
    return;
  }

  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  if (!dados) return;

  let produtos = JSON.parse(dados);

  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].id === idProduto) {
      produtos.splice(i, 1);
      break;
    }
  }

  localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos));
  carregarTabelaProdutos();
}

function fazerLogout() {
  localStorage.removeItem("docitas_usuario_logado");
  window.location.href = "login.html";
}

carregarPerfil();
