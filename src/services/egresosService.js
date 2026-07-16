import { apiClient } from "@/services/apiClient";

export const EXPENSE_CATEGORIES = [
  "Compra de mercancía",
  "Transporte",
  "Nómina",
  "Servicios",
  "Mantenimiento",
  "Otros",
];

function readExpenses() {
  return apiClient.get("/egresos");
}

function createExpense(expense) {
  return apiClient.post("/egresos", expense);
}

function updateExpense(expenseId, expense) {
  return apiClient.put(`/egresos/${expenseId}`, expense);
}

function deleteExpense(expenseId) {
  return apiClient.delete(`/egresos/${expenseId}`);
}

export const egresosService = {
  createExpense,
  deleteExpense,
  readExpenses,
  updateExpense,
};
