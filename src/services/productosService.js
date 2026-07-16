import { apiClient } from "@/services/apiClient";

function readProducts() {
  return apiClient.get("/productos");
}

function getStatus(product) {
  return product.status;
}

function createProduct(product) {
  return apiClient.post("/productos", product);
}

function updateProduct(productId, product) {
  return apiClient.put(`/productos/${productId}`, product);
}

function deleteProduct(productId) {
  return apiClient.delete(`/productos/${productId}`);
}

export const productosService = {
  createProduct,
  deleteProduct,
  getStatus,
  readProducts,
  updateProduct,
};
