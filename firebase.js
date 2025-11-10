// ===============================
// IMPORTS DO FIREBASE
// ===============================
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";


// ===============================
// CONFIGURAÇÃO DO SEU PROJETO
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCR8aoYnlyuYJkaTjqoRd57Y2tjwATs00I",
  authDomain: "gestor-financeiro-84746.firebaseapp.com",
  projectId: "gestor-financeiro-84746",
  storageBucket: "gestor-financeiro-84746.appspot.com",
  messagingSenderId: "644124581263",
  appId: "1:644124581263:web:48d29d206bc2eda3ddbffa",
  measurementId: "G-Y7NHN9H5E1"
};


// ===============================
// INICIALIZAÇÃO SEGURA
// (evita erro de app duplicado)
// ===============================
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];


// ===============================
// EXPORTS (AUTENTICAÇÃO + FIRESTORE)
// ===============================
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
