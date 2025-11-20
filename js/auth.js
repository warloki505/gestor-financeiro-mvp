// auth.js - tela de login / cadastro

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (isLogged()) {
    window.location.href = "home.html";
    return;
  }

  function showStatus(msg, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? "red" : "green";
  }

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!nome || !email || !password) {
      showStatus("Preencha todos os campos de cadastro.", true);
      return;
    }

    if (password.length < 6) {
      showStatus("A senha deve ter pelo menos 6 caracteres.", true);
      return;
    }

    const user = {
      nome,
      email,
      passwordHash: hashPassword(password),
    };

    saveUser(user);
    setLogged(false);
    showStatus("Conta criada com sucesso! Agora faça login.", false);
    signupForm.reset();
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const storedUser = loadUser();

    if (!storedUser) {
      showStatus("Nenhum usuário cadastrado ainda. Crie uma conta primeiro.", true);
      return;
    }

    const hash = hashPassword(password);

    if (storedUser.email === email && storedUser.passwordHash === hash) {
      setLogged(true);
      showStatus("Login realizado! Redirecionando...", false);
      window.location.href = "home.html";
    } else {
      showStatus("E-mail ou senha inválidos.", true);
    }
  });
});
