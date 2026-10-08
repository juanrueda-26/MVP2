// history.js — listado del historial de ventas cerradas y acceso al detalle

import { getSales } from "./storage.js";
import { formatCOP, formatDate } from "./utils.js";
import { showView } from "./router.js";
import { renderTicket } from "./invoice.js";

const body = document.getElementById("historyBody");
const emptyState = document.getElementById("historyEmpty");
const btnBack = document.getElementById("btnBackFromInvoice");

let cameFromHistory = false;

export function initHistory() {
  btnBack.addEventListener("click", () => {
    showView(cameFromHistory ? "historial" : "venta");
  });
  renderHistory();
}

export  async function renderHistory() {
  const sales =  (await getSales()).slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  body.innerHTML = "";

  sales.forEach((sale) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${String(sale.numero).padStart(5, "0")}</td>
      <td>${formatDate(sale.fecha)}</td>
      <td>${escapeHTML(sale.metodoPago)}</td>
      <td>${formatCOP(sale.total)}</td>
      <td style="text-align:right;"><button class="btn btn--ghost" type="button" style="padding:.35rem .9rem; font-size:.78rem;">Ver factura</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () => {
      cameFromHistory = true;
      renderTicket(sale, { showConfirmBanner: false });
      showView("factura");
    });
    body.appendChild(tr);
  });

  emptyState.hidden = sales.length > 0;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}
