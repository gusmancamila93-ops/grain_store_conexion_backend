import { apiClient } from "@/services/apiClient";

function readCustomers() {
  return apiClient.get("/clientes");
}

function createCustomer(customer) {
  return apiClient.post("/clientes", customer);
}

function updateCustomer(customerId, customer) {
  return apiClient.put(`/clientes/${customerId}`, customer);
}

function deleteCustomer(customerId) {
  return apiClient.delete(`/clientes/${customerId}`);
}

export const clientesService = {
  createCustomer,
  deleteCustomer,
  readCustomers,
  updateCustomer,
};
