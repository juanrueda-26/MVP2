const API_URL = "https://script.google.com/macros/s/AKfycbyJ1BDcX3Gi4ftJ72uMwIfqUMrbHnN88_B7SFIun73QWHUiGUHWohedJiyg_atRRcSVeQ/exec";   

export async function apiGet(resource) {
  const res = await fetch(`${API_URL}?resource=${resource}`, {
    method: "GET",
    redirect: "follow"
  });
  const text = await res.text(); 
  try {
    const json = JSON.parse(text);
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (e) {
    throw new Error("El servidor no devolvió un JSON válido: " + text.substring(0, 100));
  }
}

export async function apiPost(resource, action, data) {
  const res = await fetch(`${API_URL}?resource=${resource}`, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, data })
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (e) {
    throw new Error("El servidor no devolvió un JSON válido: " + text.substring(0, 100));
  }
}