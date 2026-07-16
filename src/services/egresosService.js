import { STORAGE_KEYS } from "@/services/storage";

export const EXPENSE_CATEGORIES = [
  "Compra de mercancía",
  "Transporte",
  "Nómina",
  "Servicios",
  "Mantenimiento",
  "Otros",
];

export const seedExpenses = [
  {
    id: "egr-001",
    code: "EGR-001",
    date: "2026-06-24",
    category: "Compra de mercancía",
    description: "Compra de arroz y frijol para inventario",
    value: 3250000,
    responsible: "Administrador",
  },
  {
    id: "egr-002",
    code: "EGR-002",
    date: "2026-06-23",
    category: "Transporte",
    description: "Flete proveedor regional",
    value: 420000,
    responsible: "Vendedor",
  },
  {
    id: "egr-003",
    code: "EGR-003",
    date: "2026-06-22",
    category: "Servicios",
    description: "Servicios públicos del local",
    value: 680000,
    responsible: "Contador",
  },
];

function readExpenses() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.egresos);
    return value ? JSON.parse(value) : seedExpenses;
  } catch {
    return seedExpenses;
  }
}

function saveExpenses(expenses) {
  window.localStorage.setItem(STORAGE_KEYS.egresos, JSON.stringify(expenses));
}

function createExpense(expense) {
  const expenses = readExpenses();
  const nextExpense = { ...expense, id: `egr-${Date.now()}` };
  const nextExpenses = [nextExpense, ...expenses];
  saveExpenses(nextExpenses);
  return nextExpenses;
}

function updateExpense(expenseId, expense) {
  const nextExpenses = readExpenses().map((current) =>
    current.id === expenseId ? { ...current, ...expense, id: expenseId } : current,
  );
  saveExpenses(nextExpenses);
  return nextExpenses;
}

function deleteExpense(expenseId) {
  const nextExpenses = readExpenses().filter((expense) => expense.id !== expenseId);
  saveExpenses(nextExpenses);
  return nextExpenses;
}

export const egresosService = {
  createExpense,
  deleteExpense,
  readExpenses,
  updateExpense,
};
