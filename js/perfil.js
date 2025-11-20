// perfil.js - tela de definição de perfil financeiro

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  showUserInfo();
  attachLogout("logout");

  const perfilSelect = document.getElementById("perfil-select");
  const rendaInput = document.getElementById("renda-mensal");
  const statusEl = document.getElementById("perfil-status");

  const prevEssEl = document.getElementById("prev-essenciais");
  const prevLivEl = document.getElementById("prev-livres");
  const prevPouEl = document.getElementById("prev-poupanca");
  const prevDivEl = document.getElementById("prev-dividas");

  const form = document.getElementById("perfil-form");

  function atualizarPrevistos() {
    const perfil = perfilSelect.value;
    const renda = Number(rendaInput.value || 0);
    const limites = calcularLimitesPerfil(perfil, renda);

    prevEssEl.textContent = formatMoney(limites.Essenciais);
    prevLivEl.textContent = formatMoney(limites.Livres);
    prevPouEl.textContent = formatMoney(limites.Poupanca);
    prevDivEl.textContent = formatMoney(limites.Dividas);
  }

  // Carregar perfil salvo, se existir
  const profile = loadProfile();
  if (profile) {
    if (profile.perfil) perfilSelect.value = profile.perfil;
    if (profile.rendaMensal) rendaInput.value = profile.rendaMensal;
    atualizarPrevistos();
  }

  perfilSelect.addEventListener("change", atualizarPrevistos);
  rendaInput.addEventListener("input", atualizarPrevistos);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const perfil = perfilSelect.value;
    const renda = Number(rendaInput.value || 0);

    if (!perfil || !PERFIS[perfil]) {
      statusEl.textContent = "Selecione um perfil válido.";
      return;
    }
    if (!renda || renda <= 0) {
      statusEl.textContent = "Informe uma renda mensal válida.";
      return;
    }

    const limites = calcularLimitesPerfil(perfil, renda);

    const profileToSave = {
      perfil,
      rendaMensal: renda,
      limites,
    };

    saveProfile(profileToSave);
    atualizarPrevistos();
    statusEl.textContent = "Perfil salvo com sucesso!";

    // opcional: voltar para home após alguns segundos
    setTimeout(() => {
      window.location.href = "home.html";
    }, 800);
  });
});
