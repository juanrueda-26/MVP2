import { getProducts, createProducto, updateProducto, nextProductCode, makeId } from './storage.js';
import { formatCOP, isNonNegativeNumber, showToast } from './utils.js';

let editingId = null;
let onChangeCallback = () => {};

// Si quieres usar la función de manejo que creamos:
async function manejarGuardarProducto(productoData) {
  if (productoData.id) {
    await updateProducto(productoData);
  } else {
    productoData.id = makeId ? makeId() : "prod-" + Date.now();
    await createProducto(productoData);
  }
}

// ---------- DOM ----------
const body = document.getElementById("productsBody");
const emptyState = document.getElementById("productsEmpty");
const listSearch = document.getElementById("productListSearch");

const backdrop = document.getElementById("productModalBackdrop");
const modalTitle = document.getElementById("productModalTitle");
const form = document.getElementById("productForm");
const formError = document.getElementById("productFormError");

const fId = document.getElementById("productId");
const fNombre = document.getElementById("fNombre");
const fCategoria = document.getElementById("fCategoria");
const fCodigo = document.getElementById("fCodigo");
const fPrecio = document.getElementById("fPrecio");
const fCosto = document.getElementById("fCosto");
const fSeguimiento = document.getElementById("fSeguimiento");
const fStock = document.getElementById("fStock");
const stockField = document.getElementById("stockField");

export async function initProducts(onChange) {
  onChangeCallback = onChange || (() => {});

  document.getElementById("btnNewProduct").addEventListener("click", openCreateModal);
  document.getElementById("btnCloseModal").addEventListener("click", closeModal);
  document.getElementById("btnCancelProduct").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  fSeguimiento.addEventListener("change", syncStockFieldVisibility);
  form.addEventListener("submit", handleSubmit);
  listSearch.addEventListener("input", renderProductsTable);

  await renderProductsTable();
}

// ---------- Render ----------

export async function renderProductsTable() {
  const query = (listSearch.value || "").trim().toLowerCase();
  const products = (await getProducts()).slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const filtered = query
    ? products.filter((p) =>
        [p.nombre, p.categoria, p.codigoInterno].join(" ").toLowerCase().includes(query)
      )
    : products;

  body.innerHTML = "";

  filtered.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span style="font-family: var(--font-mono); font-size: .8rem;">${escapeHTML(p.codigoInterno)}</span></td>
      <td>${escapeHTML(p.nombre)}</td>
      <td>${escapeHTML(p.categoria)}</td>
      <td>${formatCOP(p.precioVenta)}</td>
      <td>${formatCOP(p.costo)}</td>
      <td>${p.seguimientoInventario ? p.stock ?? 0 : "—"}</td>
      <td style="white-space:nowrap; text-align:right;">
        <button class="icon-btn" data-action="edit" title="Editar">✎</button>
        <button class="icon-btn" data-action="delete" title="Eliminar">✕</button>
      </td>
    `;
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(p.id));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => handleDelete(p.id));
    body.appendChild(tr);
  });

  emptyState.hidden = filtered.length > 0;
}
// ----Select para cargar categorias---
import { getCategorias } from './storage.js'; // Asegúrate de tener esta importación arriba

 export async function cargarCategoriasEnSelect(categoriaSeleccionada = "") {
  try {
    const categorias = await getCategorias();
    
    // Limpiamos y creamos la opción por defecto
    fCategoria.innerHTML = '<option value="">Seleccione una categoría...</option>';
    
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      const catId = cat.id || cat.nombre;
      const catNombre = cat.nombre || cat.name;
      
      option.value = catId;
      option.textContent = catNombre;
      
      // Si estamos editando y coincide con la categoría del producto, la seleccionamos
      if (catId === categoriaSeleccionada || catNombre === categoriaSeleccionada) {
        option.selected = true;
      }
      
      fCategoria.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar categorías en el select:", error);
  }
}
// ---------- Modal ----------
export async function openCreateModal() {
  editingId = null;
  modalTitle.textContent = "Nuevo producto";
  form.reset();
  fId.value = "";
  fCodigo.value = nextProductCode ? nextProductCode() : "";
  fSeguimiento.checked = true;
  formError.hidden = true;
  syncStockFieldVisibility();
  

  await cargarCategoriasEnSelect();
  
  backdrop.style.display = "flex";
  fNombre.focus();
}

async function openEditModal(id) {
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  editingId = id;
  modalTitle.textContent = "Editar producto";
  fId.value = product.id;
  fNombre.value = product.nombre;
  

  await cargarCategoriasEnSelect(product.categoriaId || product.categoria);

  fCodigo.value = product.codigoInterno;
  fPrecio.value = product.precioVenta;
  fCosto.value = product.costo;
  fSeguimiento.checked = product.seguimientoInventario === "Sí" || !!product.seguimientoInventario;
  fStock.value = product.stock ?? "";
  formError.hidden = true;
  syncStockFieldVisibility();
  
  backdrop.style.display = "flex";
  fNombre.focus();
}

function closeModal() {
  backdrop.style.display = "none"; // <-- Cambiado aquí para que se oculte de verdad
  editingId = null;
}


function syncStockFieldVisibility() {
  stockField.style.display = fSeguimiento.checked ? "block" : "none";
  if (!fSeguimiento.checked) fStock.value = "";
}

// ---------- Guardar / validar ----------

 export async function handleSubmit(e){
  e.preventDefault();

  const nombre = fNombre.value.trim();
  const categoria = fCategoria.value.trim();
  const codigoInterno = fCodigo.value.trim();
  const precioVenta = fPrecio.value;
  const costo = fCosto.value;
  const seguimientoInventario = fSeguimiento.checked;
  const stock = fStock.value;

  const errors = [];
  if (!nombre) errors.push("el nombre");
  if (!categoria) errors.push("la categoría");
  if (!codigoInterno) errors.push("el código interno");
  if (!isNonNegativeNumber(precioVenta)) errors.push("un precio de venta válido (≥ 0)");
  if (!isNonNegativeNumber(costo)) errors.push("un costo válido (≥ 0)");
  if (seguimientoInventario && !isNonNegativeNumber(stock)) errors.push("un stock válido (≥ 0)");
  
  const products = await getProducts();
  const duplicateCode = products.find(
    (p) => (p.codigoInterno || "").toLowerCase() === codigoInterno.toLowerCase() && p.id !== editingId
  );
  
  if (duplicateCode) errors.push("un código interno que no esté repetido");

  if (errors.length > 0) {
    formError.textContent = `Falta completar: ${errors.join(", ")}.`;
    formError.hidden = false;
    return;
  }

  const record = {
    id: editingId || makeId(),
    nombre,
    categoria,
    codigoInterno,
    precioVenta: Number(precioVenta),
    costo: Number(costo),
    seguimientoInventario,
    stock: seguimientoInventario ? Number(stock) : null,
  };

    if (editingId) {
      await updateProducto(record);
    } else {
      await createProducto(record);
    }

    closeModal();
    // Como la tabla se pinta leyendo la API, asegurate de que renderProductsTable sea async o cargue bien
    await renderProductsTable();
    onChangeCallback();
    showToast(editingId ? "Producto actualizado." : "Producto creado.");
}

 export async function handleDelete(id) {
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const confirmed = window.confirm(`¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmed) return;
  try {
    await deleteProducto(id);
   await renderProductsTable();
    if (typeof onChangeCallback === 'function') {
      onChangeCallback();
    }
    showToast("Producto eliminado.");
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    alert("No se pudo eliminar el producto del servidor: " + error.message);
  }
}


// ---------- helpers ----------

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}
