// helpers.js - funções e configurações compartilhadas

const LS_KEYS = {
  USER: "gf_user",
  LOGGED: "gf_logged",
  PROFILE: "gf_profile",
  TRANSACTIONS: "gf_transactions",
};

const PERFIS = {
  poupador: {
    nome: "Poupador",
    percentuais: {
      Essenciais: 0.4,
      Livres: 0.25,
      Poupanca: 0.2,
      Dividas: 0.15,
    },
  },
  responsavel: {
    nome: "Responsável",
    percentuais: {
      Essenciais: 0.5,
      Livres: 0.15,
      Poupanca: 0.1,
      Dividas: 0.25,
    },
  },
  padrao: {
    nome: "Padrão",
    percentuais: {
      Essenciais: 0.5,
      Livres: 0.2,
      Poupanca: 0.15,
      Dividas: 0.15,
    },
  },
};

const CATEGORIAS = {
  salario: { nome: "Salário", grupo: "RENDA" },
  renda_extra: { nome: "Renda extra", grupo: "RENDA" },
  ferias: { nome: "Férias", grupo: "RENDA" },
  alimentacao: { nome: "Alimentação", grupo: "Essenciais" },
  saude: { nome: "Saúde", grupo: "Essenciais" },
  educacao: { nome: "Educação", grupo: "Essenciais" },
  transporte: { nome: "Transporte", grupo: "Essenciais" },
  assinaturas: { nome: "Assinaturas e Streaming", grupo: "Essenciais" },
  lazer: { nome: "Lazer", grupo: "Livres" },
  vestuario: { nome: "Vestuário", grupo: "Livres" },
  reserva_pessoal: { nome: "Reserva pessoal", grupo: "Poupanca" },
  cartao: { nome: "Cartão", grupo: "Dividas" },
};

function formatMoney(v) {
  return "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
}

function getCurrentYearMonth() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

function getYearMonthFromDateStr(dateStr) {
  if (!dateStr) return getCurrentYearMonth();
  const [y, m] = dateStr.split("-");
  return `${y}-${m}`;
}

function loadUser() {
  const raw = localStorage.getItem(LS_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
}

function setLogged(flag) {
  localStorage.setItem(LS_KEYS.LOGGED, flag ? "true" : "false");
}

function isLogged() {
  return localStorage.getItem(LS_KEYS.LOGGED) === "true";
}

function requireLogin() {
  if (!isLogged()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function loadProfile() {
  const raw = localStorage.getItem(LS_KEYS.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(LS_KEYS.PROFILE, JSON.stringify(profile));
}

function loadTransactions() {
  const raw = localStorage.getItem(LS_KEYS.TRANSACTIONS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveTransactions(arr) {
  localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(arr));
}

function attachLogout(buttonId = "logout") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    setLogged(false);
    window.location.href = "index.html";
  });
}

function showUserInfo() {
  const user = loadUser();
  const el = document.getElementById("userInfo");
  if (!el) return;
  if (!user) {
    el.textContent = "Usuário local";
  } else {
    el.textContent = user.nome ? `Olá, ${user.nome}` : "Usuário local";
  }
}

function hashPassword(password) {
  // Hash simples usando btoa apenas para MVP local
  try {
    return btoa(password);
  } catch {
    return password;
  }
}

// Cálculo dos limites previstos baseado em perfil + renda
function calcularLimitesPerfil(perfilId, rendaMensal) {
  const renda = Number(rendaMensal || 0);
  const conf = PERFIS[perfilId];
  if (!conf || renda <= 0) {
    return {
      Essenciais: 0,
      Livres: 0,
      Poupanca: 0,
      Dividas: 0,
    };
  }

  const p = conf.percentuais;
  return {
    Essenciais: renda * p.Essenciais,
    Livres: renda * p.Livres,
    Poupanca: renda * p.Poupanca,
    Dividas: renda * p.Dividas,
  };
}

// Define status por ratio (previsto x realizado)
function statusPorRatio(ratio) {
  if (ratio === null || isNaN(ratio)) return "neutral";
  if (ratio < 0.7) return "green";
  if (ratio <= 1) return "yellow";
  return "red";
}

function aplicarBadgeStatus(el, ratio) {
  el.classList.remove("badge-neutral", "badge-green", "badge-yellow", "badge-red");
  let status = statusPorRatio(ratio);
  if (status === "green") {
    el.classList.add("badge-green");
    el.textContent = "Dentro do previsto";
  } else if (status === "yellow") {
    el.classList.add("badge-yellow");
    el.textContent = "Atenção";
  } else if (status === "red") {
    el.classList.add("badge-red");
    el.textContent = "Acima do limite";
  } else {
    el.classList.add("badge-neutral");
    el.textContent = "–";
  }
}
