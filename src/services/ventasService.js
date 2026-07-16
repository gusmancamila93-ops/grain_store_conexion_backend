import { STORAGE_KEYS } from "@/services/storage";

export const seedSales = [
  {
    id: "sale-001",
    code: "VEN-001",
    customer: "Mercado El Trigal",
    date: "2026-06-24",
    paymentMethod: "Contado",
    status: "Pagada",
    items: [
      { product: "Arroz Diana", quantity: 30, unitPrice: 4200 },
      { product: "Frijol Cargamanto", quantity: 16, unitPrice: 7800 },
    ],
  },
  {
    id: "sale-002",
    code: "VEN-002",
    customer: "Tienda San Jose",
    date: "2026-06-24",
    paymentMethod: "Crédito",
    status: "Pendiente",
    items: [
      { product: "Lenteja Nacional", quantity: 20, unitPrice: 5600 },
      { product: "Maíz Petado", quantity: 19, unitPrice: 3900 },
    ],
  },
  {
    id: "sale-003",
    code: "VEN-003",
    customer: "Distribuidora La Cosecha",
    date: "2026-06-23",
    paymentMethod: "Contado",
    status: "Pagada",
    items: [
      { product: "Arroz Diana", quantity: 80, unitPrice: 4200 },
      { product: "Frijol Cargamanto", quantity: 35, unitPrice: 7800 },
    ],
  },
];

function getSaleTotal(sale) {
  if (sale.items?.length) {
    return sale.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
  }

  return Number(sale.total ?? 0);
}

function normalizeSale(sale) {
  return {
    ...sale,
    items: sale.items ?? [],
    paymentMethod: sale.paymentMethod ?? "Contado",
    total: getSaleTotal(sale),
  };
}

function readSales() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.ventas);
    const sales = value ? JSON.parse(value) : seedSales;
    return sales.map(normalizeSale);
  } catch {
    return seedSales.map(normalizeSale);
  }
}

function saveSales(sales) {
  window.localStorage.setItem(STORAGE_KEYS.ventas, JSON.stringify(sales));
}

function createSale(sale) {
  const sales = readSales();
  const nextSale = normalizeSale({ ...sale, id: `sale-${Date.now()}` });
  const nextSales = [nextSale, ...sales];
  saveSales(nextSales);
  return nextSales;
}

function deleteSale(saleId) {
  const nextSales = readSales().filter((sale) => sale.id !== saleId);
  saveSales(nextSales);
  return nextSales;
}

export const ventasService = {
  createSale,
  deleteSale,
  getSaleTotal,
  readSales,
  saveSales,
};
