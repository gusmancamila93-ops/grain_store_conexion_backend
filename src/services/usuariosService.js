import { apiClient } from "@/services/apiClient";

function readUsers() {
  return apiClient.get("/usuarios");
}

function createUser(user) {
  return apiClient.post("/usuarios", user);
}

function updateUser(userId, user) {
  const body = { ...user };
  if (!body.password) delete body.password;
  return apiClient.put(`/usuarios/${userId}`, body);
}

function deleteUser(userId) {
  return apiClient.delete(`/usuarios/${userId}`);
}

export const usuariosService = {
  createUser,
  deleteUser,
  readUsers,
  updateUser,
};
