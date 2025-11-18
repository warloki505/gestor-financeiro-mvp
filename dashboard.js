// dashboard.js - lançamentos + resumo do mês

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  showUserInfo();
  attachLogout("logout");

  const alertaPerfilEl = document.getElementById("alerta-perfil");

  const resRendaEl = document.getElementById("res-renda");
  const resEssEl = document.getElementById("res-essenciais");
  const resLivEl = document.getElementById("res-livres");
  const resPouEl = document.getElementById("res-poupanca");
  const resDivEl = document.getElementById("res-dividas");
  const resSaldoEl = document.getElementById("res-saldo");

  const badgeEss = document.getElementById("res-essenciais-status");
  const badgeLiv = document.getElementById("res-livres-status");
  const badgePou = document.getElementById("res-poupanca-status");
  const badgeDiv = document.getElementById("res-dividas-status");

  const txForm = document.getElementById("tx-form");
  const txDataEl = document.getElementById("tx-data");
  const txValorEl = document.getElementById("tx-valor");
  const txTipoEl = document.getElementById("tx-tipo");
  const txCategoriaEl = document.getElementById("tx-categoria");
  const txGrupoEl = document.getElementById("tx-grupo");
  const txFormaEl = document.getElementById("tx-forma");
  const txDescricaoEl = document.getElementById("tx-descricao");
  const txFixoEl = document.getElementById("tx-fixo");
  const txStatusEl = document.getElementById("tx-status");
  const txSubmitBtn = document.getElementById("tx-submit");
  const txCancelEditBtn = document.getElementById("tx-cancel-edit");

  const filtroTipoEl = document.getElementById("filtro-tipo");
  const filtroGrupoEl = document.getElementById("filtro-grupo");
  const filtroMesEl = document.getElementById("filtro-mes");
  const txTbody = document.getElementById("tx-tbody");

  let transactions = loadTransactions();
  let editingId = null;

  // Data padrão = hoje
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  txDataEl.value = `${yyyy}-${mm}-${dd}`;

  if (!filtroMesEl.value) {
    filtroMesEl.value = getCurrentYearMonth();
  }

  function carregarPerfilOuAvisar() {
    const profile = loadProfile();
    if (!profile || !profile.perfil || !profile.rendaMensal) {
      alertaPerfilEl.classList.remove("hidden");
      txForm.querySelectorAll("input, select, button").forEach((el) => {
        if (el.id !== "tx-data") {
          el.disabled = true;
        }
      });
      return null;
    } else {
      alertaPerfilEl.classList.add("hidden");
      txForm.querySelectorAll("input, select, button").forEach((el) => {
        el.disabled = false;
      });
      return profile;
    }
  }

  function calcularTotaisDoMes(mesRef) {
    const txMes = transactions.filter((tx) => tx.mesRef === mesRef);
    const totais = {
      RENDA: 0,
      Essenciais: 0,
      Livres: 0,
      Poupanca: 0,
      Dividas: 0,
    };

    txMes.forEach((tx) => {
      const valor = Number(tx.valor || 0);
      if (tx.grupo === "RENDA") {
        totais.RENDA += valor;
      } else if (tx.grupo && totais.hasOwnProperty(tx.grupo)) {
        totais[tx.grupo] += valor;
      }
    });

    const saldo =
      totais.RENDA -
      (totais.Essenciais + totais.Livres + totais.Poupanca + totais.Dividas);

    return { totais, saldo, txMes };
  }

  function renderResumo() {
    const profile = carregarPerfilOuAvisar();
    const mesRef = filtroMesEl.value || getCurrentYearMonth();
    const { totais, saldo } = calcularTotaisDoMes(mesRef);

    resRendaEl.textContent = formatMoney(totais.RENDA);
    resEssEl.textContent = formatMoney(totais.Essenciais);
    resLivEl.textContent = formatMoney(totais.Livres);
    resPouEl.textContent = formatMoney(totais.Poupanca);
    resDivEl.textContent = formatMoney(totais.Dividas);
    resSaldoEl.textContent = formatMoney(saldo);

    if (!profile) {
      aplicarBadgeStatus(badgeEss, null);
      aplicarBadgeStatus(badgeLiv, null);
      aplicarBadgeStatus(badgePou, null);
      aplicarBadgeStatus(badgeDiv, null);
      return;
    }

    const limites = profile.limites || {};
    const ratioEss = limites.Essenciais ? totais.Essenciais / limites.Essenciais : null;
    const ratioLiv = limites.Livres ? totais.Livres / limites.Livres : null;
    const ratioPou = limites.Poupanca ? totais.Poupanca / limites.Poupanca : null;
    const ratioDiv = limites.Dividas ? totais.Dividas / limites.Dividas : null;

    aplicarBadgeStatus(badgeEss, ratioEss);
    aplicarBadgeStatus(badgeLiv, ratioLiv);
    aplicarBadgeStatus(badgePou, ratioPou);
    aplicarBadgeStatus(badgeDiv, ratioDiv);
  }

  function renderTabela() {
    const mesRef = filtroMesEl.value || getCurrentYearMonth();
    const tipoFiltro = filtroTipoEl.value;
    const grupoFiltro = filtroGrupoEl.value;

    const rows = transactions.filter((tx) => {
      if (tx.mesRef !== mesRef) return false;
      if (tipoFiltro && tx.tipo !== tipoFiltro) return false;
      if (grupoFiltro && tx.grupo !== grupoFiltro) return false;
      return true;
    });

    txTbody.innerHTML = "";

    if (rows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="9" class="empty-row">Nenhum lançamento encontrado para o filtro.</td>`;
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

  function limparFormulario() {
    txForm.reset();
    txGrupoEl.value = "";
    editingId = null;
    txSubmitBtn.textContent = "Salvar lançamento";
    txCancelEditBtn.classList.add("hidden");

    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    txDataEl.value = `${yyyy}-${mm}-${dd}`;
  }

  function renderTudo() {
    renderResumo();
    renderTabela();
  }

  // Eventos

  txCategoriaEl.addEventListener("change", () => {
    const value = txCategoriaEl.value;
    if (!value || !CATEGORIAS[value]) {
      txGrupoEl.value = "";
      return;
    }
    txGrupoEl.value = CATEGORIAS[value].grupo;
  });

  txForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const profile = loadProfile();
    if (!profile) {
      txStatusEl.textContent = "Defina primeiro seu perfil financeiro.";
      return;
    }

    const dataStr = txDataEl.value;
    const valor = Number(txValorEl.value);
    const tipo = txTipoEl.value;
    const categoria = txCategoriaEl.value;
    const grupo = txGrupoEl.value;
    const formaPagamento = txFormaEl.value.trim();
    const descricao = txDescricaoEl.value.trim();
    const fixo = txFixoEl.checked;
    const mesRef = getYearMonthFromDateStr(dataStr);

    if (!dataStr || !valor || valor <= 0 || !tipo || !categoria || !grupo) {
      txStatusEl.textContent = "Preencha os campos obrigatórios (data, tipo, categoria, valor).";
      return;
    }

    if (!editingId) {
      const novaTx = {
        id: String(Date.now()) + Math.random().toString(16).slice(2),
        data: dataStr,
        valor,
        tipo,
        categoria,
        grupo,
        formaPagamento,
        descricao,
        fixo,
        mesRef,
      };
      transactions.push(novaTx);
      txStatusEl.textContent = "Lançamento adicionado.";
    } else {
      const idx = transactions.findIndex((t) => t.id === editingId);
      if (idx !== -1) {
        transactions[idx] = {
          ...transactions[idx],
          data: dataStr,
          valor,
          tipo,
          categoria,
          grupo,
          formaPagamento,
          descricao,
          fixo,
          mesRef,
        };
        txStatusEl.textContent = "Lançamento atualizado.";
      }
    }

    saveTransactions(transactions);
    limparFormulario();
    renderTudo();
  });

  txTbody.addEventListener("click", (e) => {
    const btn = e.target;
    if (!(btn instanceof HTMLElement)) return;

    const id = btn.getAttribute("data-id");
    if (!id) return;

    if (btn.classList.contains("btn-remover")) {
      if (confirm("Deseja remover este lançamento?")) {
        transactions = transactions.filter((tx) => tx.id !== id);
        saveTransactions(transactions);
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
      txTipoEl.value = tx.tipo;
      txCategoriaEl.value = tx.categoria;
      txGrupoEl.value = tx.grupo;
      txFormaEl.value = tx.formaPagamento || "";
      txDescricaoEl.value = tx.descricao || "";
      txFixoEl.checked = !!tx.fixo;
      txStatusEl.textContent = "Editando lançamento...";
    }
  });

  txCancelEditBtn.addEventListener("click", () => {
    limparFormulario();
    txStatusEl.textContent = "";
  });

  [filtroTipoEl, filtroGrupoEl, filtroMesEl].forEach((el) => {
    el.addEventListener("change", () => {
      renderTudo();
    });
  });

  // Inicial
  carregarPerfilOuAvisar();
  renderTudo();
});
