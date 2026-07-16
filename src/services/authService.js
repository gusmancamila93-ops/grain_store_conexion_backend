import { apiClient } from "@/services/apiClient";
import { STORAGE_KEYS } from "@/services/storage";

export const MOCK_USERS = [
  { id: "usr-admin", name: "Administrador", email: "admin@grainstore.com", password: "admin123", role: "admin" },
  { id: "usr-vendedor", name: "Vendedor", email: "vendedor@grainstore.com", password: "vendedor123", role: "vendedor" },
  { id: "usr-contador", name: "Contador", email: "contador@grainstore.com", password: "contador123", role: "contador" },
];

function readSession() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.session);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(STORAGE_KEYS.session);
}

async function login({ email, password, role }) {
  const { token, user } = await apiClient.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
    role,
  });

  const session = { ...user, token };
  saveSession(session);
  return session;
}

function logout() {
  clearSession();
}

async function getProfile() {
  return apiClient.get("/auth/me");
}

async function updateProfile(data) {
  return apiClient.put("/auth/me", data);
}

export const authService = {
  clearSession,
  getProfile,
  login,
  logout,
  readSession,
  saveSession,
  updateProfile,
};
