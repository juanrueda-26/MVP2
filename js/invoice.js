// invoice.js — construye la vista de factura ("ticket") reutilizada
// tanto en la confirmación de venta como en el historial.

import { formatCOP, formatDate } from "./utils.js";

const ticketEl = document.getElementById("ticket");
let currentSale = null;

export function initInvoice() {
  document.getElementById("btnPrintInvoice").addEventListener("click", () => window.print());
}

export function renderTicket(sale, { showConfirmBanner = false } = {}) {
  currentSale = sale;

  const itemsRows = sale.items
    .map(
      (item) => `
      <tr>
        <td>
          <span class="ti-name">${escapeHTML(item.nombre)}</span>
          <span class="ti-detail">${item.cantidad} x ${formatCOP(item.precioUnitario)}</span>
        </td>
        <td class="ti-amount">${formatCOP(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  const paymentDetail =
    sale.metodoPago === "Efectivo"
      ? `
        <div><span>Recibido</span><span>${formatCOP(sale.valorRecibido)}</span></div>
        <div><span>Cambio</span><span>${formatCOP(sale.cambio)}</span></div>`
      : "";

  ticketEl.innerHTML = `
    <div class="ticket__brand">Papel y Luna</div>
    <div class="ticket__sub">Papelería &amp; artículos de escritorio</div>

    <div class="ticket__meta">
      <div><span>Factura</span><span>#${String(sale.numero).padStart(5, "0")}</span></div>
      <div><span>Fecha</span><span>${formatDate(sale.fecha)}</span></div>
      <div><span>Método</span><span>${escapeHTML(sale.metodoPago)}</span></div>
    </div>

    <hr>

    <table class="ticket__items">
      <tbody>${itemsRows}</tbody>
    </table>

    <hr>

    <div class="ticket__totals">
      <div class="grand"><span>Total</span><span>${formatCOP(sale.total)}</span></div>
      ${paymentDetail}
    </div>

    <div class="ticket__moon">☾</div>
    <div class="ticket__foot">Gracias por su compra</div>
    ${showConfirmBanner ? "" : ""}
  `;

  const banner = document.querySelector(".confirm-banner");
  if (banner) banner.remove();

  if (showConfirmBanner) {
    const banner = document.createElement("div");
    banner.className = "confirm-banner no-print";
    banner.textContent = `Venta #${sale.numero} confirmada correctamente.`;
    ticketEl.parentElement.insertBefore(banner, ticketEl);
  }
}

export function getCurrentSale() {
  return currentSale;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}
