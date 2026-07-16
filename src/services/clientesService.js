import { STORAGE_KEYS } from "@/services/storage";

export const seedCustomers = [
  {
    id: "cli-001",
    document: "900123456-1",
    name: "Mercado El Trigal",
    phone: "300 123 4567",
    email: "compras@eltrigal.com",
    address: "Cra 5 #12-34, Ibagué",
    type: "Mayorista",
    status: "Activo",
  },
  {
    id: "cli-002",
    document: "1056123456",
    name: "Tienda San Jose",
    phone: "310 555 9012",
    email: "sanjose@correo.com",
    address: "Calle 18 #7-45, Ibagué",
    type: "Minorista",
    status: "Activo",
  },
  {
    id: "cli-003",
    document: "901777888-4",
    name: "Distribuidora La Cosecha",
    phone: "318 222 3344",
    email: "admin@lacosecha.com",
    address: "Av. Ambalá #42-10, Ibagué",
    type: "Mayorista",
    status: "Pendiente",
  },
  {
    id: "cli-004",
    document: "79999000",
    name: "Granero Central",
    phone: "322 444 7788",
    email: "contacto@granerocentral.com",
    address: "Cl. 10 #3-28, Espinal",
    type: "Minorista",
    status: "Inactivo",
  },
];

function readCustomers() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.clientes);
    return value ? JSON.parse(value) : seedCustomers;
  } catch {
    return seedCustomers;
  }
}

function saveCustomers(customers) {
  window.localStorage.setItem(STORAGE_KEYS.clientes, JSON.stringify(customers));
}

function createCustomer(customer) {
  const customers = readCustomers();
  const nextCustomer = {
    ...customer,
    id: `cli-${Date.now()}`,
  };
  const nextCustomers = [nextCustomer, ...customers];
  saveCustomers(nextCustomers);
  return nextCustomers;
}

function updateCustomer(customerId, customer) {
  const nextCustomers = readCustomers().map((current) =>
    current.id === customerId ? { ...current, ...customer, id: customerId } : current,
  );
  saveCustomers(nextCustomers);
  return nextCustomers;
}

function deleteCustomer(customerId) {
  const nextCustomers = readCustomers().filter((customer) => customer.id !== customerId);
  saveCustomers(nextCustomers);
  return nextCustomers;
}

export const clientesService = {
  createCustomer,
  deleteCustomer,
  readCustomers,
  saveCustomers,
  updateCustomer,
};
