import { STORAGE_KEYS } from "@/services/storage";

export const seedUsers = [
  { id: "usr-1", name: "Administrador", email: "admin@grainstore.com", role: "Administrador", status: "Activo" },
  { id: "usr-2", name: "Vendedor", email: "vendedor@grainstore.com", role: "Vendedor", status: "Activo" },
  { id: "usr-3", name: "Contador", email: "contador@grainstore.com", role: "Contador", status: "Activo" },
];

function readUsers() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.usuarios);
    return value ? JSON.parse(value) : seedUsers;
  } catch {
    return seedUsers;
  }
}

function saveUsers(users) {
  window.localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(users));
}

function createUser(user) {
  const users = readUsers();
  const nextUser = { ...user, id: `usr-${Date.now()}` };
  const nextUsers = [nextUser, ...users];
  saveUsers(nextUsers);
  return nextUsers;
}

function updateUser(userId, user) {
  const nextUsers = readUsers().map((current) =>
    current.id === userId ? { ...current, ...user, id: userId } : current,
  );
  saveUsers(nextUsers);
  return nextUsers;
}

function deleteUser(userId) {
  const nextUsers = readUsers().filter((user) => user.id !== userId);
  saveUsers(nextUsers);
  return nextUsers;
}

export const usuariosService = {
  createUser,
  deleteUser,
  readUsers,
  updateUser,
};
