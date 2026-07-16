export const ROLES = ["admin", "vendedor", "contador"];

export const CUSTOMER_TYPES = ["Minorista", "Mayorista", "Empresa", "Otro"];

export const CUSTOMER_STATUSES = ["Activo", "Pendiente", "Inactivo"];

export const PRODUCT_CATEGORIES = [
  "Arroz",
  "Frijol",
  "Maíz",
  "Lenteja",
  "Garbanzo",
  "Trigo",
  "Quinoa",
  "Avena",
  "Soya",
  "Dulcería",
  "Bebida",
  "Otro",
];

export const PAYMENT_METHODS = ["Contado", "Crédito"];

export const SALE_STATUSES = ["Pagada", "Pendiente", "Anulada"];

export const EXPENSE_CATEGORIES = [
  "Compra de mercancía",
  "Transporte",
  "Nómina",
  "Servicios",
  "Mantenimiento",
  "Otros",
];

export const USER_STATUSES = ["Activo", "Inactivo"];

export const SYSTEM_INFO = {
  language: "Español",
  notifications: "Activas",
  backup: "Semanal",
  version: "1.0 académico",
};

export function getProductStatus(product) {
  if (Number(product.stock) <= 0) return "Agotado";
  if (Number(product.stock) <= Number(product.stockMinimo)) return "Bajo stock";
  return "Normal";
}
