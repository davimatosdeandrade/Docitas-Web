const ADMIN_EMAIL = "admin@docitas.com";
const ADMIN_SENHA = "admin123";

let usuarioAtual = localStorage.getItem("docitas_usuario_logado");
if (usuarioAtual) {
  window.location.href = "perfil.html";
}

function alternarAba(aba) {
  let formLogin = document.getElementById("form-login");
  let formCadastro = document.getElementById("form-cadastro");
  let tabBtnLogin = document.getElementById("tab-btn-login");
  let tabBtnCadastro = document.getElementById("tab-btn-cadastro");

  if (aba === "login") {
    formLogin.style.display = "block";
    formCadastro.style.display = "none";
    tabBtnLogin.classList.add("active");
    tabBtnCadastro.classList.remove("active");
  } else {
    formLogin.style.display = "none";
    formCadastro.style.display = "block";
    tabBtnLogin.classList.remove("active");
    tabBtnCadastro.classList.add("active");
  }
}

function realizarLogin(event) {
  event.preventDefault();

  let email = document.getElementById("login-email").value.trim().toLowerCase();
  let senha = document.getElementById("login-senha").value.trim();

  if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
    let admin = {
      id: 0,
      email: ADMIN_EMAIL,
      tipo: "admin"
    };

    localStorage.setItem("docitas_usuario_logado", JSON.stringify(admin));
    window.location.href = "perfil.html";
    return;
  }

  let usuariosCadastrados = localStorage.getItem("docitas_usuarios");
  let usuarios = usuariosCadastrados ? JSON.parse(usuariosCadastrados) : [];

  let usuarioEncontrado = null;
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email.toLowerCase() === email && usuarios[i].senha === senha) {
      usuarioEncontrado = usuarios[i];
      break;
    }
  }

  if (usuarioEncontrado) {
    let sessao = {
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      tipo: "cliente"
    };

    localStorage.setItem("docitas_usuario_logado", JSON.stringify(sessao));
    window.location.href = "index.html";
  } else {
    alert("E-mail ou senha inválidos! Verifique os dados ou crie uma conta.");
  }
}

function realizarCadastro(event) {
  event.preventDefault();

  let email = document.getElementById("cad-email").value.trim().toLowerCase();
  let senha = document.getElementById("cad-senha").value.trim();

  if (email === ADMIN_EMAIL) {
    alert("Este e-mail é reservado para a administração do sistema!");
    return;
  }

  let usuariosCadastrados = localStorage.getItem("docitas_usuarios");
  let usuarios = usuariosCadastrados ? JSON.parse(usuariosCadastrados) : [];

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email.toLowerCase() === email) {
      alert("Este e-mail já está cadastrado! Faça login.");
      alternarAba("login");
      return;
    }
  }

  let novoUsuario = {
    id: Date.now(),
    email: email,
    senha: senha,
    tipo: "cliente"
  };

  usuarios.push(novoUsuario);
  localStorage.setItem("docitas_usuarios", JSON.stringify(usuarios));

  let sessao = {
    id: novoUsuario.id,
    email: novoUsuario.email,
    tipo: "cliente"
  };
  localStorage.setItem("docitas_usuario_logado", JSON.stringify(sessao));
  window.location.href = "index.html";
}
