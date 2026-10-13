import { initRouter, onViewChange } from "./router.js";
import { initProducts, renderProductsTable } from "./productos.js";
import { initSale } from "./venta.js";
import { initHistory, renderHistory } from "./historial.js";
import { initInvoice } from "./invoice.js";
import { initCategorias, renderCategoriasTable } from './categorias.js';

initInvoice();
initProducts(() => {});
initSale();
initHistory();
initCategorias(); // Inicializa los eventos del modal y botones una sola vez
initRouter();

onViewChange((view) => {
  if (view === "historial") renderHistory();
  if (view === "productos") renderProductTable();
  if (view === "categorias") renderCategoriasTable(); // <--- Aquí va perfectamente integrado
});

window.addEventListener("sale:completed", () => {
  renderHistory();
  renderProductTable();
});

