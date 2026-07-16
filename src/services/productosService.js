import { STORAGE_KEYS } from "@/services/storage";

export const seedProducts = [
  {
    id: "prod-001",
    code: "ARR-001",
    name: "Arroz Diana",
    category: "Arroz",
    stock: 48,
    minStock: 10,
    price: 4200,
  },
  {
    id: "prod-002",
    code: "FRJ-002",
    name: "Frijol Cargamanto",
    category: "Frijol",
    stock: 8,
    minStock: 12,
    price: 7800,
  },
  {
    id: "prod-003",
    code: "LEN-003",
    name: "Lenteja Nacional",
    category: "Lenteja",
    stock: 0,
    minStock: 8,
    price: 5600,
  },
  {
    id: "prod-004",
    code: "MAI-004",
    name: "Maíz Petado",
    category: "Maíz",
    stock: 35,
    minStock: 10,
    price: 3900,
  },
];

function readProducts() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.productos);
    return value ? JSON.parse(value) : seedProducts;
  } catch {
    return seedProducts;
  }
}

function saveProducts(products) {
  window.localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(products));
}

function getStatus(product) {
  if (Number(product.stock) <= 0) return "Agotado";
  if (Number(product.stock) <= Number(product.minStock)) return "Bajo stock";
  return "Normal";
}

function createProduct(product) {
  const products = readProducts();
  const nextProduct = {
    ...product,
    id: `prod-${Date.now()}`,
  };
  const nextProducts = [nextProduct, ...products];
  saveProducts(nextProducts);
  return nextProducts;
}

function updateProduct(productId, product) {
  const nextProducts = readProducts().map((current) =>
    current.id === productId ? { ...current, ...product, id: productId } : current,
  );
  saveProducts(nextProducts);
  return nextProducts;
}

function deleteProduct(productId) {
  const nextProducts = readProducts().filter((product) => product.id !== productId);
  saveProducts(nextProducts);
  return nextProducts;
}

export const productosService = {
  createProduct,
  deleteProduct,
  getStatus,
  readProducts,
  saveProducts,
  updateProduct,
};
