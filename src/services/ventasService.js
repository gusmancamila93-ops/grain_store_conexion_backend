import { apiClient } from "@/services/apiClient";

function readSales() {
  return apiClient.get("/ventas");
}

function getSaleById(saleId) {
  return apiClient.get(`/ventas/${saleId}`);
}

function createSale(sale) {
  return apiClient.post("/ventas", sale);
}

function deleteSale(saleId) {
  return apiClient.delete(`/ventas/${saleId}`);
}

export const ventasService = {
  createSale,
  deleteSale,
  getSaleById,
  readSales,
};
