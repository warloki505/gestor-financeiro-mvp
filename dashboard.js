// dashboard.js – MVP localStorage com perfis, grupos e previsto x realizado

const USER_KEY = "gf_user";
const LOGGED_KEY = "gf_logged";
const SETTINGS_KEY = "gf_settings";
const TX_KEY = "gf_transactions";

// ====== CONFIGURAÇÕES FIXAS ======

const PERFIS = {
  poupador: {
    nome: "Poupador",
    percentuais: {
      Essenciais: 0.4,
      Livres: 0.25,
      Poupança: 0.2,
      Dívidas: 0.15,
    },
  },
  responsavel: {
    nome: "Responsável",
    percentuais: {
      Essenciais: 0.5,
      Livres: 0.15,
      Poupança: 0.1,
      Dívidas: 0.25,
    },
  },
  padrao: {
    nome: "Padrão",
    percentuais: {
      Essenciais: 0.5,
      Livres: 0.2,
      Poupança: 0.15,
      Dívidas: 0.15,
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
  reserva_pessoal: { nome: "Reserva pessoal", grupo: "Poupança" },
  cartao: { nome: "Cartão", grupo: "Dívidas" },
};

const GRUPOS = ["RENDA", "Essenciais", "Livres", "Poupança", "Dívidas"];

// ====== ELEMENTOS DA TELA ======

const listaSaldoEl = document.getElementById("userBalance");
const userInfoEl = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logout");

// Perfil
const perfilForm = document.getElementById("perfil-form");
const perfilSelect = document.getElementById("perfil-select");
const rendaInput = document.getElementById("renda-mensal");
const perfilStatusEl = document.getElementById("perfil-status");

// Previsto
const prevEssenciaisEl = document.getElementById("prev-essenciais");
const prevLivresEl = document.getElementById("prev-livres");
const prevPoupancaEl = document.getElementById("prev-poupanca");
const prevDividasEl = document.getElementById("prev-dividas");

// Resumo mensal
const resRendaEl = document.getElementById("res-renda");
const resEssenciaisEl = document.getElementById("res-essenciais");
const resLivresEl = document.getElementById("res-livres");
const resPoupancaEl = document.getElementById("res-poupanca");
const resDividasEl = document.getElementById("res-dividas");
const resSaldoEl = document.getElementById("res-saldo");

const resEssenciaisStatus = document.getElementById("res-essenciais-status");
const resLivresStatus = document.getElementById("res-livres-status");
const resPoupancaStatus = document.getElementById("res-poupanca-status");
const resDividasStatus = document.getElementById("res-dividas-status");

// Form lançamento
const txForm = document.getElementById("tx-form");
const txDataEl = document.getElementById("tx-data");
const txValorEl = document.getElementById("tx-valor");
const txCategoriaEl = document.getElementById("tx-categoria");
const txGrupoEl = document.getElementById("tx-grupo");
const txFormaEl = document.getElementById("tx-forma");
const txDescricaoEl = document.getElementById("tx-descricao");
const txFixoEl = document.getElementById("tx-fixo");
const txStatusEl = document.getElementById("tx-status");
const txSubmitBtn = document.getElementById("tx-submit");
const txCancelEditBtn = document.getElementById("tx-cancel-edit");

// Filtros / tabela
const filtroTipoEl = document.getElementById("filtro-tipo");
const filtroGrupoEl = document.getElementById("filtro-grupo");
const filtroMesEl = document.getElementById("filtro-mes");
const txTbody = document.getElementById("tx-tbody");

// ====== ESTADO EM MEMÓRIA ======

let settings = {
  perfil: "poupador",
  rendaMensal: 0,
};

let transactions = [];
let editingId = null;

// ====== FUNÇÕES DE APOIO ======

function formatMoney(v) {
  return "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
}

function getCurrentYearMonth() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

function getYearMonthFromDateStr(dateStr) {
  // dateStr formato "yyyy-mm-dd"
  if (!dateStr) return getCurrentYearMonth();
  const [y, m] = dateStr.split("-");
  return `${y}-${m}`;
}

function loadFromStorage() {
  // login
  const logged = localStorage.getItem(LOGGED_KEY) === "true";
  if (!logged) {
    window.location.href = "index.html";
    return;
  }

  // usuário
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userInfoEl.textContent = user.nome ? `Olá, ${user.nome}` : "Usuário local";
    } catch {
      userInfoEl.textContent = "Usuário local";
    }
  } else {
    userInfoEl.textContent = "Usuário local";
  }

  // settings
  const setStr = localStorage.getItem(SETTINGS_KEY);
  if (setStr) {
    try {
      settings = JSON.parse(setStr);
    } catch {
      settings = { perfil: "poupador", rendaMensal: 0 };
    }
  }

  // transações
  const txStr = localStorage.getItem(TX_KEY);
  if (txStr) {
    try {
      transactions = JSON.parse(txStr);
      if (!Array.isArray(transactions)) transactions = [];
    } catch {
      transactions = [];
    }
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function saveTransactions() {
  localStorage.setItem(TX_KEY, JSON.stringify(transactions));
}

function setBadgeStatus(el, ratio) {
  el.classList.remove("badge-neutral", "badge-green", "badge-yellow", "badge-red");

  if (ratio === null) {
    el.classList.add("badge-neutral");
    el.textContent = "–";
    return;
  }

  if (ratio <= 0.8) {
    el.classList.add("badge-green");
    el.textContent = "Dentro do previsto";
  } else if (ratio <= 1) {
    el.classList.add("badge-yellow");
    el.textContent = "Atenção";
  } else {
    el.classList.add("badge-red");
    el.textContent = "Acima do previsto";
  }
}

// ====== CÁLCULOS PRINCIPAIS ======

function calcularPrevistos() {
  const renda = Number(settings.rendaMensal || 0);
  const perfilConfig = PERFIS[settings.perfil]?.percentuais;

  if (!perfilConfig || renda <= 0) {
    return {
      Essenciais: 0,
      Livres: 0,
      Poupança: 0,
      Dívidas: 0,
    };
  }

  return {
    Essenciais: renda * perfilConfig.Essenciais,
    Livres: renda * perfilConfig.Livres,
    Poupança: renda * perfilConfig.Poupança,
    Dívidas: renda * perfilConfig.Dívidas,
  };
}

function calcularTotaisDoMes(mesRef) {
  const txMes = transactions.filter((tx) => tx.mesRef === mesRef);

  const totais = {
    RENDA: 0,
    Essenciais: 0,
    Livres: 0,
    Poupança: 0,
    Dívidas: 0,
  };

  txMes.forEach((tx) => {
    const valor = Number(tx.valor || 0);
    if (tx.grupo === "RENDA") {
      totais.RENDA += valor;
    } else if (GRUPOS.includes(tx.grupo)) {
      // saída
      totais[tx.grupo] += valor;
    }
  });

  const saldo =
    totais.RENDA -
    (totais.Essenciais + totais.Livres + totais.Poupança + totais.Dívidas);

  return { totais, saldo, txMes };
}

// ====== RENDERIZAÇÃO ======

function renderPrevistos() {
  const prev = calcularPrevistos();

  prevEssenciaisEl.textContent = formatMoney(prev.Essenciais);
  prevLivresEl.textContent = formatMoney(prev.Livres);
  prevPoupancaEl.textContent = formatMoney(prev.Poupança);
  prevDividasEl.textContent = formatMoney(prev.Dívidas);
}

function renderResumo() {
  const mesFiltro = filtroMesEl.value || getCurrentYearMonth();
  const { totais, saldo } = calcularTotaisDoMes(mesFiltro);
  const prev = calcularPrevistos();

  resRendaEl.textContent = formatMoney(totais.RENDA);
  resEssenciaisEl.textContent = formatMoney(totais.Essenciais);
  resLivresEl.textContent = formatMoney(totais.Livres);
  resPoupancaEl.textContent = formatMoney(totais.Poupança);
  resDividasEl.textContent = formatMoney(totais.Dívidas);
  resSaldoEl.textContent = formatMoney(saldo);
  listaSaldoEl.textContent = "Saldo: " + formatMoney(saldo);

  const ratioEss = prev.Essenciais ? totais.Essenciais / prev.Essenciais : null;
  const ratioLiv = prev.Livres ? totais.Livres / prev.Livres : null;
  const ratioPou = prev.Poupança ? totais.Poupança / prev.Poupança : null;
  const ratioDiv = prev.Dívidas ? totais.Dívidas / prev.Dívidas : null;

  setBadgeStatus(resEssenciaisStatus, ratioEss);
  setBadgeStatus(resLivresStatus, ratioLiv);
  setBadgeStatus(resPoupancaStatus, ratioPou);
  setBadgeStatus(resDividasStatus, ratioDiv);
}

function renderTabela() {
  const mesFiltro = filtroMesEl.value || getCurrentYearMonth();
  const tipoFiltro = filtroTipoEl.value;
  const grupoFiltro = filtroGrupoEl.value;

  const rows = transactions.filter((tx) => {
    if (tx.mesRef !== mesFiltro) return false;
    if (tipoFiltro && tx.tipo !== tipoFiltro) return false;
    if (grupoFiltro && tx.grupo !== grupoFiltro) return false;
    return true;
  });

  txTbody.innerHTML = "";

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="9" class="empty-row">Nenhum lançamento encontrado para o filtro.</td>';
    txTbody.appendChild(tr);
    return;
  }

  rows.forEach((tx) => {
    const tr = document.createElement("tr");
    const data = new Date(tx.data);
    const dataStr = data.toLocaleDateString("pt-BR");

    const cat = CATEGORIAS[tx.categoria]?.nome || "-";
    const grupo = tx.grupo || "-";
    const tipoLabel = tx.tipo === "entrada" ? "Entrada" : "Saída";

    tr.innerHTML = `
      <td>${dataStr}</td>
      <td>${tx.descricao || "-"}</td>
      <td>${cat}</td>
      <td>${grupo}</td>
      <td>${tipoLabel}</td>
      <td>${formatMoney(tx.valor)}</td>
      <td>${tx.formaPagamento || "-"}</td>
      <td>${tx.fixo ? "Sim" : "Não"}</td>
      <td>
        <button class="btn-small btn-edit" data-id="${tx.id}">Editar</button>
        <button class="btn-small btn-remover" data-id="${tx.id}">Remover</button>
      </td>
    `;

    txTbody.appendChild(tr);
  });
}

function renderTudo() {
  // preencher campos de perfil
  perfilSelect.value = settings.perfil;
  rendaInput.value = settings.rendaMensal || "";

  if (!filtroMesEl.value) {
    filtroMesEl.value = getCurrentYearMonth();
  }

  renderPrevistos();
  renderResumo();
  renderTabela();
}

// ====== EVENTOS ======

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.setItem(LOGGED_KEY, "false");
  window.location.href = "index.html";
});

// Mudança de categoria → define grupo automático
txCategoriaEl.addEventListener("change", () => {
  const value = txCategoriaEl.value;
  if (!value || !CATEGORIAS[value]) {
    txGrupoEl.value = "";
    return;
  }
  txGrupoEl.value = CATEGORIAS[value].grupo;
});

// Salvar perfil
perfilForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const perfil = perfilSelect.value;
  const renda = Number(rendaInput.value);

  if (!perfil || !PERFIS[perfil]) {
    perfilStatusEl.textContent = "Selecione um perfil válido.";
    return;
  }
  if (!renda || renda <= 0) {
    perfilStatusEl.textContent = "Informe uma renda mensal válida.";
    return;
  }

  settings.perfil = perfil;
  settings.rendaMensal = renda;
  saveSettings();
  perfilStatusEl.textContent = "Perfil salvo com sucesso!";
  renderTudo();
});

// Criar / atualizar transação
txForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const dataStr = txDataEl.value;
  const valor = Number(txValorEl.value);
  const categoria = txCategoriaEl.value;
  const grupo = txGrupoEl.value;
  const tipo = document.querySelector('input[name="tx-tipo"]:checked')?.value || "saida";
  const formaPagamento = txFormaEl.value;
  const descricao = txDescricaoEl.value.trim();
  const fixo = txFixoEl.checked;
  const mesRef = getYearMonthFromDateStr(dataStr);

  if (!dataStr || !valor || valor <= 0 || !categoria || !grupo) {
    txStatusEl.textContent = "Preencha todos os campos obrigatórios.";
    return;
  }

  if (!editingId) {
    // novo
    const novaTx = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      data: dataStr,
      valor,
      categoria,
      grupo,
      tipo,
      formaPagamento,
      descricao,
      fixo,
      mesRef,
    };
    transactions.push(novaTx);
    txStatusEl.textContent = "Lançamento adicionado.";
  } else {
    // edição
    const index = transactions.findIndex((t) => t.id === editingId);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        data: dataStr,
        valor,
        categoria,
        grupo,
        tipo,
        formaPagamento,
        descricao,
        fixo,
        mesRef,
      };
      txStatusEl.textContent = "Lançamento atualizado.";
    }
  }

  saveTransactions();
  limparFormulario();
  renderTudo();
});

// Clique em editar/remover
txTbody.addEventListener("click", (e) => {
  const btn = e.target;
  if (!(btn instanceof HTMLElement)) return;

  const id = btn.getAttribute("data-id");
  if (!id) return;

  if (btn.classList.contains("btn-remover")) {
    if (confirm("Deseja remover este lançamento?")) {
      transactions = transactions.filter((tx) => tx.id !== id);
      saveTransactions();
      renderTudo();
    }
  }

  if (btn.classList.contains("btn-edit")) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    editingId = id;
    txSubmitBtn.textContent = "Salvar alterações";
    txCancelEditBtn.classList.remove("hidden");

    txDataEl.value = tx.data;
    txValorEl.value = tx.valor;
    txCategoriaEl.value = tx.categoria;
    txGrupoEl.value = tx.grupo;
    txFormaEl.value = tx.formaPagamento || "";
    txDescricaoEl.value = tx.descricao || "";
    txFixoEl.checked = !!tx.fixo;

    const tipoRadio = document.querySelector(
      `input[name="tx-tipo"][value="${tx.tipo}"]`
    );
    if (tipoRadio) tipoRadio.checked = true;

    txStatusEl.textContent = "Editando lançamento...";
  }
});

// Cancelar edição
txCancelEditBtn.addEventListener("click", () => {
  limparFormulario();
});

// Filtros
[filtroTipoEl, filtroGrupoEl, filtroMesEl].forEach((el) => {
  el.addEventListener("change", () => {
    renderResumo();
    renderTabela();
  });
});

// ====== OUTRAS FUNÇÕES ======

function limparFormulario() {
  txForm.reset();
  txGrupoEl.value = "";
  editingId = null;
  txSubmitBtn.textContent = "Salvar lançamento";
  txCancelEditBtn.classList.add("hidden");
}

// ====== INICIALIZAÇÃO ======

(function init() {
  loadFromStorage();

  // Data padrão = hoje
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  txDataEl.value = `${yyyy}-${mm}-${dd}`;

  renderTudo();
})();
