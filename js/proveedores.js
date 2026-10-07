import { getProveedores, createProveedor, updateProveedor, deleteProveedor, getCompras } from './storage.js';
import { showToast } from './utils.js';

let editingId = null;
let onChangeCallback = () => {};

const body = document.getElementById("proveedoresBody");
const form = document.getElementById("proveedorForm");
const fNombre = document.getElementById("fProveedorNombre");
const fTelefono = document.getElementById("fProveedorTelefono");
const fCorreo = document.getElementById("fProveedorCorreo");

export async function initProveedores(onChange) {
  onChangeCallback = onChange || (() => {});
  if (form) form.addEventListener("submit", handleSubmit);
  await renderProveedoresTable();
}

export async function renderProveedoresTable() {
  if (!body) return;
  const proveedores = await getProveedores();
  body.innerHTML = "";

  proveedores.forEach((prov) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prov.nombre || ""}</td>
      <td>${prov.telefono || ""}</td>
      <td>${prov.correo || ""}</td>
      <td style="text-align:right;">
        <button class="icon-btn" data-action="edit" title="Editar">✏️</button>
        <button class="icon-btn" data-action="delete" title="Eliminar">❌</button>
      </td>
    `;
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(prov));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => handleDeleteProveedor(prov.id));
    body.appendChild(tr);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const nombre = fNombre.value.trim();
  const telefono = fTelefono.value.trim();
  const correo = fCorreo.value.trim();
  if (!nombre) return;

  try {
    if (editingId) {
      await updateProveedor({ id: editingId, nombre, telefono, correo });
      showToast("Proveedor actualizado.");
    } else {
      await createProveedor({ id: "prov-" + Date.now(), nombre, telefono, correo });
      showToast("Proveedor creado.");
    }

    form.reset();
    editingId = null;
    await renderProveedoresTable();
    onChangeCallback();
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    showToast("Error al guardar en el servidor.", "error");
  }
}

async function handleDeleteProveedor(id) {
  // Validación obligatoria: Proveedor con compras asociadas no se puede eliminar
  const compras = await getCompras ? await getCompras() : [];
  const tieneCompras = compras.some(c => c.proveedorId === id || c.proveedor === id);

  if (tieneCompras) {
    alert("No se puede eliminar este proveedor porque tiene compras registradas asociadas.");
    return;
  }

  if (!window.confirm("¿Estás seguro de eliminar este proveedor?")) return;

  try {
    await deleteProveedor(id);
    await renderProveedoresTable();
    onChangeCallback();
    showToast("Proveedor eliminado.");
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    showToast("No se pudo eliminar el proveedor.", "error");
  }
}

function openEditModal(prov) {
  editingId = prov.id;
  fNombre.value = prov.nombre || "";
  fTelefono.value = prov.telefono || "";
  fCorreo.value = prov.correo || "";
}