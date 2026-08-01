// ── firebase.js ──────────────────────────────────────────────────
// Inicialização do Firebase · Projeto aniversario-2026
// ─────────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCBoZH5AnirQum5JM54aAYhbIOuV2XFtOo",
  authDomain:        "aniversario-2026.firebaseapp.com",
  projectId:         "aniversario-2026",
  storageBucket:     "aniversario-2026.firebasestorage.app",
  messagingSenderId: "459708892996",
  appId:             "1:459708892996:web:fb2ecad1a2296c16847911"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
