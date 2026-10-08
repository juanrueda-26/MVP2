import { initRouter, onViewChange } from "./router.js";
import { initProducts, renderProductsTable } from "./productos.js";
import { initSale } from "./venta.js";
import { initHistory, renderHistory } from "./historial.js";
import { initInvoice } from "./invoice.js";

initInvoice();
initProducts(() => {
 
});
initSale();
initHistory();
initRouter();

onViewChange((view) => {
  if (view === "historial") renderHistory();
  if (view === "productos") renderProductsTable();
});

window.addEventListener("sale:completed", () => {
  renderHistory();
  renderProductsTable();
});
