// frontend/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR8aoYnlyuYJkaTjqoRd57Y2tjwATs00I",
  authDomain: "gestor-financeiro-84746.firebaseapp.com",
  projectId: "gestor-financeiro-84746",
  storageBucket: "gestor-financeiro-84746.firebasestorage.app",
  messagingSenderId: "644124581263",
  appId: "1:644124581263:web:48d29d206bc2eda3ddbffa",
  measurementId: "G-Y7NHN9H5E1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
