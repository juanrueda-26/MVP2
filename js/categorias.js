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