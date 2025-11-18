// home.js - tela de índice inicial

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  showUserInfo();
  attachLogout("logout");

  const perfilResumoEl = document.getElementById("perfilResumo");
  const profile = loadProfile();

  if (!profile || !profile.perfil || !profile.rendaMensal) {
    perfilResumoEl.innerHTML = '<p class="hint">Você ainda não definiu seu perfil financeiro. Acesse "Ver / Alterar perfil financeiro".</p>';
    return;
  }

  const confPerfil = PERFIS[profile.perfil];
  const limites = profile.limites || {};
  const renda = Number(profile.rendaMensal || 0);

  perfilResumoEl.innerHTML = `
    <p><strong>Perfil:</strong> ${confPerfil ? confPerfil.nome : profile.perfil}</p>
    <p><strong>Renda do mês:</strong> ${formatMoney(renda)}</p>
    <ul class="hint">
      <li>Despesas Essenciais: até ${formatMoney(limites.Essenciais || 0)}</li>
      <li>Despesas Livres: até ${formatMoney(limites.Livres || 0)}</li>
      <li>Poupança: ${formatMoney(limites.Poupanca || 0)}</li>
      <li>Dívidas: até ${formatMoney(limites.Dividas || 0)}</li>
    </ul>
  `;
});
