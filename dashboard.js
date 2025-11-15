// dashboard.js – versão sem Firebase, usando só localStorage

const USER_KEY = "gf_user";
const LOGGED_KEY = "gf_logged";
const TX_KEY = "gf_transactions"; // array de transações

const lista = document.getElementById("lista");
const saldoEl = document.getElementById("userBalance");
const userInfoEl = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("add-form");

// Garante que só entra aqui se estiver "logado"
const logged = localStorage.getItem(LOGGED_KEY) === "true";
if (!logged) {
  window.location.href = "index.html";
}

// Carrega usuário
const userStr = localStorage.getItem(USER_KEY);
let user = null;
if (userStr) {
  user = JSON.parse(userStr);
  userInfoEl.textContent = user.nome
    ? `Olá, ${user.nome}`
    : "Usuário local";
} else {
  userInfoEl.textContent = "Usuário local";
}

// Carrega transações salvas
let transactions = [];
const txStr = localStorage.getItem(TX_KEY);
if (txStr) {
  try {
    transactions = JSON.parse(txStr);
  } catch (e) {
    transactions = [];
  }
}

// Função para salvar no localStorage
function saveTransactions() {
  localStorage.setItem(TX_KEY, JSON.stringify(transactions));
}

// Renderiza lista e saldo
function render() {
  lista.innerHTML = "";
  let saldo = 0;

  if (transactions.length === 0) {
    lista.innerHTML = "<li>Nenhuma transação cadastrada ainda.</li>";
  } else {
    transactions.forEach((tx, index) => {
      if (tx.tipo === "entrada") {
        saldo += tx.valor;
      } else {
        saldo -= tx.valor;
      }

      const li = document.createElement("li");
      li.className = "tx-item";

      const left = document.createElement("div");
      left.className = "tx-left";
      left.innerHTML = `
        <strong>${tx.descricao}</strong>
        <small>${tx.tipo === "entrada" ? "Entrada" : "Saída"} - ${new Date(
        tx.data
      ).toLocaleDateString("pt-BR")}</small>
      `;

      const right = document.createElement("div");
      right.className = "tx-right";
      right.innerHTML = `
        <span>${tx.tipo === "entrada" ? "+" : "-"} R$ ${tx.valor
        .toFixed(2)
        .replace(".", ",")}</span>
        <button data-index="${index}" class="btn-remover">Remover</button>
      `;

      li.appendChild(left);
      li.appendChild(right);
      lista.appendChild(li);
    });
  }

  saldoEl.textContent =
    "Saldo: R$ " + saldo.toFixed(2).replace(".", ",");
}

// Adicionar transação
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value.trim();
  const valorNum = Number(document.getElementById("valor").value);
  const tipo = document.querySelector('input[name="tipo"]:checked').value;

  if (!descricao || !valorNum || isNaN(valorNum)) {
    alert("Preencha descrição e um valor válido.");
    return;
  }

  const nova = {
    descricao,
    valor: valorNum,
    tipo, // "entrada" ou "saida"
    data: Date.now(),
  };

  transactions.push(nova);
  saveTransactions();
  render();
  e.target.reset();
});

// Remover transação (delegação de evento)
lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remover")) {
    const index = Number(e.target.getAttribute("data-index"));
    transactions.splice(index, 1);
    saveTransactions();
    render();
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.setItem(LOGGED_KEY, "false");
  window.location.href = "index.html";
});

// Render inicial
render();
