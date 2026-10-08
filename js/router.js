// router.js — navegación entre vistas (sin framework, sin recarga de página)

const views = ["venta", "productos", "historial", "factura"];
const listeners = [];

export function onViewChange(fn) {
  listeners.push(fn);
}

export function showView(viewName) {
  if (!views.includes(viewName)) viewName = "venta";

  views.forEach((name) => {
    const section = document.getElementById(`view-${name}`);
    if (section) section.hidden = name !== viewName;
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.view === viewName;
    tab.classList.toggle("is-active", isActive);
    if (isActive) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  listeners.forEach((fn) => fn(viewName));
}

export function initRouter() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });
  showView("venta");
}
