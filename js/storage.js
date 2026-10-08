import { apiGet, apiPost } from './api.js';

// --- CATEGORÍAS ---
export async function getCategorias() {
  return await apiGet('categorias');
}
export async function createCategoria(data) {
  return await apiPost('categorias', 'create', data);
}
export async function updateCategoria(data) {
  return await apiPost('categorias', 'update', data);
}
export async function deleteCategoria(id) {
  return await apiPost('categorias', 'delete', { id });
}

// --- CLIENTES ---
export async function getClientes() {
  return await apiGet('clientes');
}
export async function createCliente(data) {
  return await apiPost('clientes', 'create', data);
}
export async function updateCliente(data) {
  return await apiPost('clientes', 'update', data);
}
export async function deleteCliente(id) {
  return await apiPost('clientes', 'delete', { id });
}

// --- PROVEEDORES ---
export async function getProveedores() {
  return await apiGet('proveedores');
}
export async function createProveedor(data) {
  return await apiPost('proveedores', 'create', data);
}
export async function updateProveedor(data) {
  return await apiPost('proveedores', 'update', data);
}
export async function deleteProveedor(id) {
  return await apiPost('proveedores', 'delete', { id });
}
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`No se pudo leer "${key}" de localStorage`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`No se pudo guardar "${key}" en localStorage`, err);
  }
}

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

// ---------- Productos ----------
// 1. Obtener listado mediante GET

export async function getProducts() {
  try {
    return await apiGet('productos');
  } catch (error) {
    console.error("Error al cargar productos:", error.message);
    throw error;
  }
}

// 2. Crear un registro mediante POST (action: "create")
export async function createProducto(productoData) {
  try {
    return await apiPost('productos', 'create', productoData);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    throw error;
  }
}

// 3. Actualizar un registro mediante POST (action: "update")
export async function updateProducto(productoData) {
  try {
    return await apiPost('productos', 'update', productoData);
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    throw error;
  }
}

// 4. Eliminar un registro mediante POST (action: "delete")
export async function deleteProducto(idProducto) {
  try {
    return await apiPost('productos', 'delete', { id: idProducto });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    throw error;
  }
}

// --- COMPRAS ---
export async function getCompras() {
  return await apiGet('compras');
}

export async function createCompra(compraData) {
  return await apiPost('compras', 'create', compraData);
}

// --- VENTAS ---
export async function getSales() {
  return await apiGet('ventas');
}

export async function createSale(saleData) {
  return await apiPost('ventas', 'create', saleData);
}

export async function updateSale(saleData) {
  return await apiPost('ventas', 'update', saleData);
}

export async function deleteSale(id) {
  return await apiPost('ventas', 'delete', { id });
}

// ---------- Contadores (para folios/códigos) ----------

export async function getCounters() {
  const products = await getProducts();
  if (!products || products.length === 0) return "PROD-001";
  
  // O puedes calcular un consecutivo dinámico basado en la longitud o el último código
  const numero = products.length + 1;
  return `PROD-${String(numero).padStart(3, '0')}`;
}
export async function nextProductCode() {
  const products = await getProducts();
  const numero = (products ? products.length : 0) + 1;
  return `PL-${String(numero).padStart(4, "0")}`;
}   
export async function nextSaleNumber() {
  const sales = await getSales();
  const numero = (sales ? sales.length : 0) + 1;
  return numero;
}

export function makeId() {
  return uid();
}

// ---------- Datos de ejemplo (solo la primera vez) ----------

export async function seedIfEmpty() {
  const products = [];
  for (let i = 0; i < seed.length; i++) {
    const p = seed[i];
    const codigo = await nextProductCode();
    // ...
  }
}

  const seed = [
    { nombre: "Cuaderno cosido 100 hojas", categoria: "Cuadernos", precioVenta: 6500, costo: 4200, seguimientoInventario: true, stock: 24 },
    { nombre: "Esfero punta fina negro", categoria: "Escritura", precioVenta: 1800, costo: 900, seguimientoInventario: true, stock: 60 },
    { nombre: "Resma papel carta", categoria: "Papelería", precioVenta: 15900, costo: 12500, seguimientoInventario: true, stock: 10 },
    { nombre: "Marcador permanente", categoria: "Escritura", precioVenta: 3200, costo: 1900, seguimientoInventario: false, stock: null },
    { nombre: "Tijeras punta roma", categoria: "Manualidades", precioVenta: 4500, costo: 2600, seguimientoInventario: true, stock: 15 },
  ];

const products = [];
for (let i = 0; i < seed.length; i++) {
  const p = seed[i];
  const codigo = await nextProductCode(); 
  products.push({
    id: uid(),
    codigoInterno: codigo,
    ...p
  });
}


