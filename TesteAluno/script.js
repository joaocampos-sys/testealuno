const MIN_SENHA = 6;
const CHAVE = "usuarios";

function validarNome(nome) {
  return nome.trim().length >= 3;
}

function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validarSenha(senha) {
  return senha.length >= MIN_SENHA && /\d/.test(senha);
}

function senhasIguais(senha, confirmar) {
  return senha === confirmar && confirmar !== "";
}

function obterUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE)) || [];
}

function emailExiste(email) {
  return obterUsuarios().some(u => u.email === email.trim().toLowerCase());
}

function salvarUsuario(usuario) {
  const lista = obterUsuarios();
  lista.push({
    nome: usuario.nome.trim(),
    email: usuario.email.trim().toLowerCase(),
    senha: usuario.senha
  });
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

function autenticar(email, senha) {
  const usuario = obterUsuarios().find(
    u => u.email === email.trim().toLowerCase() && u.senha === senha
  );
  return usuario || null;
}

function marcar(input, ok, idErro, texto) {
  input.classList.remove("erro", "sucesso");
  input.classList.add(ok ? "sucesso" : "erro");
  document.getElementById(idErro).textContent = ok ? "" : texto;
  return ok;
}

function mostrarMensagem(id, msg, cor) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.color = cor;
}

function limparFormulario(idForm) {
  document.querySelectorAll("#" + idForm + " input").forEach(i => {
    i.classList.remove("erro", "sucesso");
  });
  document.querySelectorAll("#" + idForm + " .erro-msg").forEach(s => {
    s.textContent = "";
  });
}

function mostrarAba(aba) {
  const cadastro = aba === "cadastro";
  document.getElementById("formCadastro").classList.toggle("oculto", !cadastro);
  document.getElementById("formLogin").classList.toggle("oculto", cadastro);
  document.getElementById("abaCadastro").classList.toggle("ativa", cadastro);
  document.getElementById("abaLogin").classList.toggle("ativa", !cadastro);
}

function cadastrar() {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");

  limparFormulario("formCadastro");

  const emailOk = validarEmail(email.value);
  const duplicado = emailOk && emailExiste(email.value);

  const resultados = [
    marcar(nome, validarNome(nome.value), "erroNome", "Nome obrigatório (mínimo 3 caracteres)"),
    marcar(email, emailOk && !duplicado, "erroEmail", duplicado ? "Email já cadastrado" : "Email inválido"),
    marcar(senha, validarSenha(senha.value), "erroSenha", "Mínimo " + MIN_SENHA + " caracteres e 1 número"),
    marcar(confirmar, senhasIguais(senha.value, confirmar.value), "erroConfirmar", "As senhas não coincidem")
  ];

  if (resultados.includes(false)) {
    mostrarMensagem("msgCadastro", "❌ Verifique os campos!", "red");
    return;
  }

  salvarUsuario({ nome: nome.value, email: email.value, senha: senha.value });
  mostrarMensagem("msgCadastro", "✅ Cadastro realizado com sucesso!", "green");
}

function login() {
  const email = document.getElementById("loginEmail");
  const senha = document.getElementById("loginSenha");

  limparFormulario("formLogin");
  mostrarMensagem("msgLogin", "", "black");

  if (!validarEmail(email.value)) {
    marcar(email, false, "erroLoginEmail", "Email inválido");
    mostrarMensagem("msgLogin", "❌ Verifique o email!", "red");
    return;
  }

  const usuario = autenticar(email.value, senha.value);

  if (!usuario) {
    marcar(email, false, "erroLoginEmail", "");
    marcar(senha, false, "erroLoginSenha", "");
    mostrarMensagem("msgLogin", "❌ Email ou senha inválidos!", "red");
    return;
  }

  marcar(email, true, "erroLoginEmail", "");
  marcar(senha, true, "erroLoginSenha", "");
  mostrarMensagem("msgLogin", "✅ Login realizado! Bem-vindo(a), " + usuario.nome + "!", "green");
}

function testesUnitarios() {
  console.assert(validarEmail("teste@gmail.com") === true, "Email válido falhou");
  console.assert(validarEmail("teste@") === false, "Email inválido passou");
  console.assert(validarNome("Maria") === true, "Nome válido falhou");
  console.assert(validarNome("Jo") === false, "Nome curto passou");
  console.assert(validarNome("") === false, "Nome vazio passou");
  console.assert(validarSenha("123456") === true, "Senha válida falhou");
  console.assert(validarSenha("abc") === false, "Senha inválida passou");
  console.assert(validarSenha("abcdefg") === false, "Senha sem número passou");
  console.assert(senhasIguais("123456", "123456") === true, "Senhas iguais falhou");
  console.assert(senhasIguais("123456", "123") === false, "Senhas diferentes passou");
  console.log("✅ Testes de unidade concluídos");
}

function testesIntegracao() {
  const backup = localStorage.getItem(CHAVE);
  localStorage.removeItem(CHAVE);

  salvarUsuario({ nome: "Ana Campos", email: "ana@teste.com", senha: "abc123" });

  console.assert(obterUsuarios().length === 1, "Cadastro não salvou no localStorage");
  console.assert(autenticar("ana@teste.com", "abc123") !== null, "Login válido falhou");
  console.assert(autenticar("ana@teste.com", "errada1") === null, "Login com senha errada passou");
  console.assert(autenticar("naoexiste@teste.com", "abc123") === null, "Login com usuário inexistente passou");

  if (backup === null) {
    localStorage.removeItem(CHAVE);
  } else {
    localStorage.setItem(CHAVE, backup);
  }
  console.log("✅ Testes de integração concluídos");
}

testesUnitarios();
testesIntegracao();