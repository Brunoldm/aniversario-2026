// ── confirmacao.js ────────────────────────────────────────────────
// Lógica da página de confirmação de presença
// Firebase Firestore · Modo Admin via ?admin=true
// ─────────────────────────────────────────────────────────────────

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ── Admin: detecta ?admin=true na URL ────────────────────────────
const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";

if (isAdmin) {
  document.getElementById("admin-badge").classList.remove("hidden");
  document.getElementById("lista-admin").classList.remove("hidden");
  // Admin vê a lista de confirmados em tempo real
  escutarConfirmados();
}

// ── Confirmar presença ────────────────────────────────────────────
window.confirmarPresenca = async function () {
  const nome = document.getElementById("campo-nome").value.trim();
  const ac1  = document.getElementById("campo-ac1").value.trim();
  const ac2  = document.getElementById("campo-ac2").value.trim();
  const ac3  = document.getElementById("campo-ac3").value.trim();

  // Validação
  if (!nome) {
    document.getElementById("form-erro").classList.remove("hidden");
    document.getElementById("campo-nome").focus();
    return;
  }

  // Monta lista de acompanhantes (só os preenchidos)
  const acompanhantes = [ac1, ac2, ac3].filter(a => a !== "");

  try {
    // Botão de loading
    const btn = document.querySelector(".btn-cta");
    btn.textContent = "Confirmando...";
    btn.disabled = true;

    // Salva no Firestore
    await addDoc(collection(db, "confirmados"), {
      nome,
      acompanhantes,
      total: 1 + acompanhantes.length, // quem confirmou + acompanhantes
      criadoEm: serverTimestamp(),
    });

    // Exibe mensagem de sucesso
    document.getElementById("form-card").classList.add("hidden");
    document.getElementById("sucesso-card").classList.remove("hidden");

  } catch (e) {
    console.error("Erro ao confirmar:", e);
    const btn = document.querySelector(".btn-cta");
    btn.textContent = "✨ Confirmar Presença";
    btn.disabled = false;
    alert("Erro ao confirmar. Tente novamente.");
  }
};

// ── Admin: escuta confirmados em tempo real ───────────────────────
function escutarConfirmados() {
  const container = document.getElementById("lista-admin-itens");

  onSnapshot(collection(db, "confirmados"), (snapshot) => {
    container.innerHTML = "";

    // Cabeçalho com contagem total
    let totalPessoas = 0;
    const itens = [];

    snapshot.forEach((docItem) => {
      const d = docItem.data();
      totalPessoas += d.total || 1;
      itens.push({ id: docItem.id, ...d });
    });

    // Ordena por data de criação
    itens.sort((a, b) => {
      if (!a.criadoEm || !b.criadoEm) return 0;
      return a.criadoEm.seconds - b.criadoEm.seconds;
    });

    // Resumo
    const resumo = document.createElement("div");
    resumo.style.cssText = `
      text-align:center; margin-bottom:20px; padding:12px;
      background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.2);
      border-radius:4px; color:#E8C97A; font-size:0.85rem; font-weight:600;
      letter-spacing:0.06em;
    `;
    resumo.innerHTML = `
      ✦ ${itens.length} confirmação(ões) · ${totalPessoas} pessoa(s) no total ✦
    `;
    container.appendChild(resumo);

    if (itens.length === 0) {
      container.innerHTML += `
        <p style="text-align:center; color:rgba(245,237,216,0.4); font-size:0.85rem; padding:20px 0;">
          Nenhuma confirmação ainda.
        </p>`;
      return;
    }

    // Renderiza cada confirmação
    itens.forEach((item) => {
      const card = document.createElement("div");
      card.className = "conf-item";

      // Monta acompanhantes
      let acompStr = "";
      if (item.acompanhantes && item.acompanhantes.length > 0) {
        acompStr = item.acompanhantes
          .map((a, i) => `Acompanhante ${i + 1}: ${escapeHtml(a)}`)
          .join("<br/>");
      }

      card.innerHTML = `
        <div class="conf-item-nome">
          ${escapeHtml(item.nome)}
          <span style="font-size:0.72rem; font-weight:400;
                       color:rgba(201,168,76,0.5); margin-left:8px;">
            (${item.total || 1} pessoa${(item.total || 1) > 1 ? "s" : ""})
          </span>
        </div>
        ${acompStr ? `<div class="conf-item-acomp">${acompStr}</div>` : ""}
        <div class="conf-item-acoes">
          <button class="btn-deletar" onclick="deletarConfirmado('${item.id}')">
            🗑 Remover
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  });
}

// ── Admin: deletar confirmação ────────────────────────────────────
window.deletarConfirmado = async function (id) {
  try {
    await deleteDoc(doc(db, "confirmados", id));
  } catch (e) {
    console.error("Erro ao deletar:", e);
  }
};

// ── Utilitário ────────────────────────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text || ""));
  return div.innerHTML;
}
