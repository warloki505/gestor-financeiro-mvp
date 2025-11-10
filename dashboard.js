// frontend/js/dashboard.js
import { auth, db } from "./firebase.js";
import { observeAuth } from "./auth.js";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

let currentUid = null;
let unsubscribeTransactions = null;

function $(id){return document.getElementById(id);}

function renderTransactions(items){
  const list = $("transactionsList");
  list.innerHTML = "";
  if(items.length===0){
    list.innerHTML = "<p>Nenhuma transação ainda.</p>";
    return;
  }
  items.forEach(tx => {
    const el = document.createElement("div");
    el.className = "tx-item";
    el.innerHTML = `
      <div class="tx-left"><strong>${tx.type === "income" ? "+" : "-" } R$ ${Number(tx.amount).toFixed(2)}</strong><div class="tx-cat">${tx.category || ""}</div></div>
      <div class="tx-right"><div class="tx-desc">${tx.description || ""}</div><div class="tx-date">${(tx.date && tx.date.toDate) ? tx.date.toDate().toLocaleString() : ""}</div><button data-id="${tx.id}" class="btn-delete">Excluir</button></div>
    `;
    list.appendChild(el);
  });
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async (e)=>{
      const txId = e.target.dataset.id;
      await deleteTransaction(txId);
    });
  });
}

export async function addTransaction(amount, type, category, description){
  if(!currentUid) throw new Error("Usuário não autenticado");
  amount = Number(amount);
  if(isNaN(amount) || amount <= 0) throw new Error("Valor inválido");
  const txCol = collection(db, "users", currentUid, "transactions");
  await addDoc(txCol, {
    type, amount, category: category || "", description: description || "", date: serverTimestamp()
  });
}

async function listenTransactions(uid){
  if(unsubscribeTransactions) unsubscribeTransactions();
  const txCol = collection(db, "users", uid, "transactions");
  const q = query(txCol, orderBy("date", "desc"));
  unsubscribeTransactions = onSnapshot(q, async (snapshot)=>{
    const items = [];
    snapshot.forEach(d => items.push({ id: d.id, ...d.data() }));
    renderTransactions(items);
    let saldo = 0;
    items.forEach(i => { saldo += (i.type === "income" ? Number(i.amount) : -Number(i.amount)); });
    $("userBalance").innerText = "R$ " + saldo.toFixed(2);
  });
}

export async function deleteTransaction(txId){
  if(!currentUid) return;
  const txRef = doc(db, "users", currentUid, "transactions", txId);
  await deleteDoc(txRef);
}

observeAuth((user)=>{
  if(user){
    currentUid = user.uid;
    $("userEmail").innerText = user.email || "";
    listenTransactions(currentUid);
    if(location.pathname.endsWith("index.html") || location.pathname.endsWith("/")){
      location.href = "dashboard.html";
    }
  } else {
    currentUid = null;
    if(location.pathname.endsWith("dashboard.html")){
      location.href = "index.html";
    }
  }
});

window.addEventListener("load", ()=>{
  const form = $("txForm");
  if(form){
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const amount = $("tx-amount").value;
      const type = document.querySelector('input[name="tx-type"]:checked').value;
      const category = $("tx-category").value;
      const description = $("tx-desc").value;
      try{
        await addTransaction(amount, type, category, description);
        form.reset();
      }catch(err){
        alert(err.message);
      }
    });
  }
  const logoutBtn = $("logoutBtn");
  if(logoutBtn) logoutBtn.addEventListener("click", async ()=>{ await import('./auth.js').then(m=>m.logout()); location.href='index.html'; });
});
