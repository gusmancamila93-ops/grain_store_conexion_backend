import { STORAGE_KEYS } from "@/services/storage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function getToken() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    const session = raw ? JSON.parse(raw) : null;
    return session?.token ?? null;
  } catch {
    return null;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

async function request(path, { method = "GET", body, params } = {}) {
  const token = getToken();

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Ocurrió un error inesperado. Intenta de nuevo.");
  }

  return data;
}

export const apiClient = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
