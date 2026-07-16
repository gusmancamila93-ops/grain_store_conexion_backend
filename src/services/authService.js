import { STORAGE_KEYS } from "@/services/storage";

export const MOCK_USERS = [
  {
    id: "usr-admin",
    name: "Administrador",
    email: "admin@grainstore.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "usr-vendedor",
    name: "Vendedor",
    email: "vendedor@grainstore.com",
    password: "vendedor123",
    role: "vendedor",
  },
  {
    id: "usr-contador",
    name: "Contador",
    email: "contador@grainstore.com",
    password: "contador123",
    role: "contador",
  },
];

function toSession(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

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

function login({ email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = MOCK_USERS.find(
    (candidate) =>
      candidate.email === normalizedEmail &&
      candidate.password === password &&
      candidate.role === role,
  );

  if (!user) {
    throw new Error("Credenciales invalidas para el rol seleccionado.");
  }

  const session = toSession(user);
  saveSession(session);
  return session;
}

function logout() {
  clearSession();
}

export const authService = {
  clearSession,
  login,
  logout,
  readSession,
  saveSession,
};
