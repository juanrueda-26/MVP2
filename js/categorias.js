import { apiGet, apiPost } from './api.js';

/**
 * Obtiene la lista de categorías desde Google Sheets.
 */
export async function cargarCategorias() {
  try {
    const categorias = await apiGet("categorias");
    return categorias;
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    throw error;
  }
}

/**
 * Inicializa los eventos de la vista y el modal de categorías.
 */
export function initCategorias() {
  const btnNew = document.getElementById("btnNewCategoria");
  const backdrop = document.getElementById("categoriaModalBackdrop");
  const btnClose = document.getElementById("btnCloseCategoriaModal");
  const btnCancel = document.getElementById("btnCancelCategoria");
  const form = document.getElementById("categoriaForm");
  const errorEl = document.getElementById("categoriaFormError");

  if (!btnNew || !backdrop) return;

  // Abrir modal para nueva categoría
  btnNew.addEventListener("click", () => {
    document.getElementById("categoriaModalTitle").textContent = "Nueva categoría";
    document.getElementById("categoriaId").value = "";
    document.getElementById("fCategoriaNombre").value = "";
    if (errorEl) errorEl.hidden = true;
    backdrop.hidden = false;
  });

  // Cerrar modal
  const closeModal = () => { backdrop.hidden = true; };
  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Manejar el envío del formulario (Crear)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      const nombreInput = document.getElementById("fCategoriaNombre");
      const nombre = nombreInput.value.trim();

      if (!nombre) {
        if (errorEl) {
          errorEl.textContent = "El nombre de la categoría es obligatorio.";
          errorEl.hidden = false;
        }
        return;
      }

      try {
        // Generar ID único en el frontend (siguiendo tu arquitectura)
        const id = crypto.randomUUID ? crypto.randomUUID() : 'cat-' + Date.now();

        await guardarCategoria({ id, nombre });
        
        closeModal();
        await renderCategoriasTable(); // Recarga la tabla automáticamente
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = "Error al guardar: " + error.message;
          errorEl.hidden = false;
        }
      }
    });
  }
}
/**
 * Agrega una nueva categoría al sistema.
 * @param {Object} datosCategoria - Objeto con los datos de la categoría (ej: { nombre: "Bebidas" })
 */
export async function guardarCategoria(datosCategoria) {
  try {
    const resultado = await apiPost("categorias", "create", datosCategoria);
    return resultado;
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    throw error;
  }
}

/**
 * Renderiza la tabla de categorías en el DOM.
 */
export async function renderCategoriasTable() {
  const tbody = document.getElementById("categoriasBody");
  const emptyState = document.getElementById("categoriasEmpty");
  
  if (!tbody) return;

  try {
    const categorias = await cargarCategorias();
    tbody.innerHTML = "";
    
    if (!categorias || categorias.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;
    
    categorias.forEach(cat => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cat.nombre || ""}</td>
        <td style="text-align: right;">
          <button class="icon-btn btn-delete-cat" data-id="${cat.id}" title="Eliminar">❌</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Opcional: Agregar eventos a los botones de eliminar
    attachCategoriaListeners();
  } catch (error) {
    console.error("Error al renderizar categorías:", error);
  }
}

/**
 * Maneja los clics en los botones de acción de la tabla de categorías.
 */
function attachCategoriaListeners() {
  const tbody = document.getElementById("categoriasBody");
  if (!tbody) return;

  // Delegación de eventos para eliminar
  tbody.querySelectorAll(".btn-delete-cat").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

      try {
        await apiPost("categorias", "delete", { id });
        await renderCategoriasTable();
      } catch (error) {
        alert("No se pudo eliminar la categoría: " + error.message);
      }
    });
  });
}