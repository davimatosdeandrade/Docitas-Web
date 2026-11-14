/**
 * ==========================================================================
 * DOCITAS - SCRIPT PRINCIPAL
 * Baseado estritamente no material das aulas:
 * - LocalStorage (setItem, getItem, removeItem, JSON.parse, JSON.stringify)
 * - Manipulação simples de DOM (getElementById, innerHTML, onclick)
 * 
 * MODELO DO PRODUTO (Para cadastro no painel do Administrador):
 * {
 *   id: 1,                          // Número identificador único (ex: Date.now())
 *   nome: "Brigadeiro Belga",       // Nome do doce
 *   preco: 6.50,                    // Preço (número)
 *   descricao: "Chocolate nobre...",// Descrição textual
 *   destaque: "Mais pedido",        // Selo / Tag ("Novidade", "Especial", etc.)
 *   cor: "#E9A98B",                 // Cor de fundo do card (hex da paleta)
 *   imagem: "img/brigadeiro.jpg"    // URL ou caminho da imagem salva
 * }
 * ==========================================================================
 */

// Chave onde os produtos ficam salvos no LocalStorage
const CHAVE_PRODUTOS = "docitas_produtos";

// ==========================================================================
// 1. GERENCIAMENTO DE PRODUTOS NO LOCALSTORAGE
// ==========================================================================

// Retorna todos os produtos salvos no LocalStorage
function obterProdutos() {
  let dados = localStorage.getItem(CHAVE_PRODUTOS);
  
  if (dados) {
    return JSON.parse(dados);
  }
  
  // Se não houver nada salvo, retorna array vazio
  return [];
}

// Salva a lista de produtos no LocalStorage (usada pelo Admin ao adicionar/excluir)
function salvarProdutos(listaProdutos) {
  localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(listaProdutos));
}

// ==========================================================================
// 2. GERENCIAMENTO DE USUÁRIO E SESSÃO
// ==========================================================================

// Retorna o usuário logado atualmente (ou null se deslogado)
function obterUsuarioLogado() {
  let dados = localStorage.getItem("docitas_usuario_logado");
  if (dados) {
    return JSON.parse(dados);
  }
  return null;
}

// ==========================================================================
// 3. GERENCIAMENTO DO CARRINHO INDIVIDUAL NO LOCALSTORAGE
// ==========================================================================

// Retorna o carrinho individual do usuário ativo
function obterCarrinho() {
  let usuario = obterUsuarioLogado();
  if (!usuario) {
    return [];
  }
  
  let chaveCarrinho = "docitas_carrinho_" + usuario.id;
  let dados = localStorage.getItem(chaveCarrinho);
  
  if (dados) {
    return JSON.parse(dados);
  }
  return [];
}

// Salva o carrinho do usuário atual no LocalStorage
function salvarCarrinho(carrinho) {
  let usuario = obterUsuarioLogado();
  if (!usuario) return;
  
  let chaveCarrinho = "docitas_carrinho_" + usuario.id;
  localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
}

// Limpa o carrinho do usuário atual (ao finalizar compra)
function limparCarrinho() {
  let usuario = obterUsuarioLogado();
  if (!usuario) return;
  
  let chaveCarrinho = "docitas_carrinho_" + usuario.id;
  localStorage.removeItem(chaveCarrinho);
  atualizarContadorCarrinho();
}

// Atualiza o contador de itens no ícone do carrinho
function atualizarContadorCarrinho() {
  let elementoContador = document.getElementById("cart-count");
  if (!elementoContador) return;
  
  let carrinho = obterCarrinho();
  let total = 0;
  
  for (let i = 0; i < carrinho.length; i++) {
    total += carrinho[i].quantidade;
  }
  
  elementoContador.innerHTML = total;
}

// ==========================================================================
// 4. ADICIONAR PRODUTO AO CARRINHO (VINCULADO AO ID DO USUÁRIO)
// ==========================================================================

function adicionarAoCarrinho(idProduto) {
  // 1. Verifica autenticação de usuário
  let usuario = obterUsuarioLogado();
  if (!usuario) {
    alert("Você precisa entrar na sua conta ou criar uma conta para adicionar produtos ao carrinho!");
    window.location.href = "login.html";
    return;
  }
  
  // 2. Busca o produto direto do LocalStorage
  let produtos = obterProdutos();
  let produtoSelecionado = null;
  
  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].id === idProduto) {
      produtoSelecionado = produtos[i];
      break;
    }
  }
  
  if (!produtoSelecionado) {
    alert("Produto não encontrado no LocalStorage!");
    return;
  }
  
  // 3. Adiciona ou incrementa no carrinho individual do usuário
  let carrinho = obterCarrinho();
  let itemJaExiste = false;
  
  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === idProduto) {
      carrinho[i].quantidade += 1;
      itemJaExiste = true;
      break;
    }
  }
  
  if (!itemJaExiste) {
    carrinho.push({
      id: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco,
      quantidade: 1,
      usuarioId: usuario.id
    });
  }
  
  // 4. Persiste no LocalStorage individual
  salvarCarrinho(carrinho);
  
  // 5. Atualiza o número no topo
  atualizarContadorCarrinho();
  
  alert(produtoSelecionado.nome + " foi adicionado ao seu carrinho!");
  
  // 6. Redireciona para o carrinho
  window.location.href = "carrinho.html";
}

// ==========================================================================
// 5. RENDERIZAÇÃO DOS PRODUTOS VINDOS DO LOCALSTORAGE
// ==========================================================================

// Mostra os produtos lidos do LocalStorage na tela inicial
function mostrarProdutos() {
  let grid = document.getElementById("products-grid");
  if (!grid) return;
  
  // 1. Busca os produtos diretamente do LocalStorage
  let produtos = obterProdutos();
  
  // Limpa o grid antes de montar
  grid.innerHTML = "";
  
  // 2. Se o LocalStorage estiver vazio, exibe mensagem informativa
  if (produtos.length === 0) {
    grid.innerHTML = `
      <div class="sem-produtos-box">
        <h3>Nenhum doce cadastrado no momento</h3>
        <p>Aguardando o Administrador cadastrar os primeiros produtos na plataforma.</p>
      </div>
    `;
    return;
  }
  
  // 3. Se houver produtos no LocalStorage, monta os cards dinamicamente
  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];
    let precoFormatado = Number(p.preco).toFixed(2).replace(".", ",");
    let corFundo = p.cor || "#E9A98B";
    let destaque = p.destaque || "Doce Artesanal";
    let imagemSrc = p.imagem || "img/doce-placeholder.png";
    
    grid.innerHTML += `
      <article class="product-card">
        <div class="card-banner" style="background-color: ${corFundo};">
          <span class="badge-tag">${destaque}</span>
          <img src="${imagemSrc}" alt="${p.nome}" class="product-img">
        </div>
        
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="product-title">${p.nome}</h3>
            <span class="product-price">R$ ${precoFormatado}</span>
          </div>
          <p class="product-desc">${p.descricao}</p>
          
          <div class="card-footer">
            <button type="button" class="add-cart-btn" onclick="adicionarAoCarrinho(${p.id})">
              Adicionar
            </button>
            <button type="button" class="circle-action-btn" onclick="adicionarAoCarrinho(${p.id})" title="Adicionar à sacola">
              +
            </button>
          </div>
        </div>
      </article>
    `;
  }
}

mostrarProdutos();
atualizarContadorCarrinho();