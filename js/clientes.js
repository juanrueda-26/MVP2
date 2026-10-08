import { getClientes, createCliente, updateCliente, deleteCliente, getVentas } from './storage.js';
import { showToast } from './utils.js';

let editingId = null;
let onChangeCallback = () => {};

const body = document.getElementById("clientesBody");
const form = document.getElementById("clienteForm");
const fNombre = document.getElementById("fClienteNombre");
const fTelefono = document.getElementById("fClienteTelefono");
const fCorreo = document.getElementById("fClienteCorreo");

export async function initClientes(onChange) {
  onChangeCallback = onChange || (() => {});
  if (form) form.addEventListener("submit", handleSubmit);
  await renderClientesTable();
}

export async function renderClientesTable() {
  if (!body) return;
  const clientes = await getClientes();
  body.innerHTML = "";

  clientes.forEach((cli) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cli.nombre || ""}</td>
      <td>${cli.telefono || ""}</td>
      <td>${cli.correo || ""}</td>
      <td style="text-align:right;">
        <button class="icon-btn" data-action="edit" title="Editar">✏️</button>
        <button class="icon-btn" data-action="delete" title="Eliminar">❌</button>
      </td>
    `;
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(cli));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => handleDeleteCliente(cli.id));
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
      await updateCliente({ id: editingId, nombre, telefono, correo });
      showToast("Cliente actualizado.");
    } else {
      await createCliente({ id: "cli-" + Date.now(), nombre, telefono, correo });
      showToast("Cliente creado.");
    }

    form.reset();
    editingId = null;
    await renderClientesTable();
    onChangeCallback();
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    showToast("Error al guardar en el servidor.", "error");
  }
}

async function handleDeleteCliente(id) {
  // Validación opcional/requerida si el cliente tiene ventas a crédito o asociadas
  const ventas = await getVentas ? await getVentas() : [];
  const tieneVentas = ventas.some(v => v.clienteId === id || v.cliente === id);

  if (tieneVentas) {
    alert("No se puede eliminar este cliente porque tiene ventas asociadas.");
    return;
  }

  if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

  try {
    await deleteCliente(id);
    await renderClientesTable();
    onChangeCallback();
    showToast("Cliente eliminado.");
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    showToast("No se pudo eliminar el cliente.", "error");
  }
}

function openEditModal(cli) {
  editingId = cli.id;
  fNombre.value = cli.nombre || "";
  fTelefono.value = cli.telefono || "";
  fCorreo.value = cli.correo || "";
}