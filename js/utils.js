// utils.js — helpers compartidos entre módulos

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value) {
  const n = Number(value) || 0;
  return currencyFormatter.format(n);
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isNonNegativeNumber(value) {
  return value !== "" && value !== null && !Number.isNaN(Number(value)) && Number(value) >= 0;
}

let toastTimer = null;
export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}
