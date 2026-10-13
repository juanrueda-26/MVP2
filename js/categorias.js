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
 * Agrega una nueva categoría al sistema.
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

/**
 * Inicializa los eventos de la vista y el modal de categorías de forma segura.
 */
/**
 * Inicializa los eventos de la vista y el modal de categorías de forma segura.
 */
export function initCategorias() {
  // Usar .closest() para capturar el clic de forma infalible en el botón o sus hijos
  document.addEventListener("click", (e) => {
    const btnNew = e.target.closest("#btnNewCategoria");
    if (btnNew) {
      e.stopPropagation(); // Evita que el evento se propague a otros modales o vistas
      
      const backdrop = document.getElementById("categoriaModalBackdrop");
      const errorEl = document.getElementById("categoriaFormError");
      
      document.getElementById("categoriaModalTitle").textContent = "Nueva categoría";
      document.getElementById("categoriaId").value = "";
      document.getElementById("fCategoriaNombre").value = "";
      if (errorEl) errorEl.hidden = true;
      if (backdrop) backdrop.hidden = false;
    }
  });

  // Función de cierre que busca dinámicamente el backdrop para evitar referencias nulas
  const closeModal = () => { 
    const backdrop = document.getElementById("categoriaModalBackdrop");
    if (backdrop) backdrop.hidden = true; 
  };

  const btnClose = document.getElementById("btnCloseCategoriaModal");
  const btnCancel = document.getElementById("btnCancelCategoria");
  const form = document.getElementById("categoriaForm");
  const errorEl = document.getElementById("categoriaFormError");

  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);
  
  // Cerrar al hacer clic fuera del contenido del modal (en el fondo oscuro)
  document.addEventListener("click", (e) => {
    const backdrop = document.getElementById("categoriaModalBackdrop");
    if (backdrop && e.target === backdrop) {
      closeModal();
    }
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
        const id = crypto.randomUUID ? crypto.randomUUID() : 'cat-' + Date.now();
        await guardarCategoria({ id, nombre });
        
        closeModal();
        await renderCategoriasTable();
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = "Error al guardar: " + error.message;
          errorEl.hidden = false;
        }
      }
    });
  }
}