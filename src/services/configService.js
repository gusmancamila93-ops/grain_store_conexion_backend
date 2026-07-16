import { apiClient } from "@/services/apiClient";

function getTienda() {
  return apiClient.get("/configuracion/tienda");
}

function updateTienda(data) {
  return apiClient.put("/configuracion/tienda", data);
}

function getSistema() {
  return apiClient.get("/configuracion/sistema");
}

export const configService = { getTienda, updateTienda, getSistema };
