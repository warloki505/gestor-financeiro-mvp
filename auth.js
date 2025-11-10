// ===============================
// IMPORTS
// ===============================
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// ===============================
// CADASTRO DE USUÁRIO
// ===============================
export async function register(email, password, nome) {
  try {
    // cria conta
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // envia verificação
    await sendEmailVerification(userCred.user);

    // salva dados mínimos no Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      nome,
      email,
      saldo: 0,
      criadoEm: Date.now()
    });

    return {
      success: true,
      message: "Cadastro realizado! Verifique seu e-mail antes de entrar."
    };

  } catch (err) {
    return {
      success: false,
      message: tratarErroFirebase(err)
    };
  }
}


// ===============================
// LOGIN DO USUÁRIO
// ===============================
export async function login(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    // verifica e-mail
    if (!res.user.emailVerified) {
      return {
        success: false,
        message: "Confirme seu e-mail antes de entrar."
      };
    }

    return {
      success: true,
      message: "Login realizado com sucesso!",
      user: res.user
    };

  } catch (err) {
    return {
      success: false,
      message: tratarErroFirebase(err)
    };
  }
}


// ===============================
// OBSERVADOR DE AUTENTICAÇÃO
// ===============================
export function observeAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user || null);
  });
}


// ===============================
// LOGOUT
// ===============================
export async function logout() {
  await signOut(auth);
}


// ===============================
// TRATAMENTO DE ERROS DO FIREBASE
// ===============================
function tratarErroFirebase(err) {
  const erro = err.message.toLowerCase();

  if (erro.includes("email-already-in-use")) return "Este e-mail já está cadastrado.";
  if (erro.includes("invalid-email")) return "E-mail inválido.";
  if (erro.includes("weak-password")) return "A senha deve ter pelo menos 6 caracteres.";
  if (erro.includes("wrong-password")) return "Senha incorreta.";
  if (erro.includes("user-not-found")) return "Usuário não encontrado.";
  if (erro.includes("network")) return "Falha de conexão. Tente novamente.";
  
  return "Erro inesperado: " + err.message;
}
