import { prisma } from "#config/db.js";
import { SYSTEM_INFO } from "#utils/constants.js";

const DEFAULT_TIENDA = {
  id: 1,
  nombre: "Grain Store",
  nit: "900123456-1",
  direccion: "Cra 5 #12-34, Ibagué",
  telefono: "300 123 4567",
  correo: "contacto@grainstore.com",
  moneda: "COP",
  densidadDashboard: "Cómoda",
  alertaStockBajo: "10 unidades",
  modoVisual: "Claro / Oscuro",
};

function toPublicTienda(row) {
  return {
    company: {
      name: row.nombre,
      nit: row.nit,
      address: row.direccion,
      phone: row.telefono,
      email: row.correo,
    },
    preferences: {
      currency: row.moneda,
      dashboardDensity: row.densidadDashboard,
      lowStockAlert: row.alertaStockBajo,
      visualMode: row.modoVisual,
    },
  };
}

async function getRow() {
  const tienda = await prisma.configuracionTienda.findUnique({ where: { id: 1 } });
  if (tienda) return tienda;
  return prisma.configuracionTienda.create({ data: DEFAULT_TIENDA });
}

async function getTienda() {
  return toPublicTienda(await getRow());
}

async function updateTienda({ company, preferences }) {
  await getRow();
  const tienda = await prisma.configuracionTienda.update({
    where: { id: 1 },
    data: {
      nombre: company?.name,
      nit: company?.nit,
      direccion: company?.address,
      telefono: company?.phone,
      correo: company?.email,
      moneda: preferences?.currency,
      densidadDashboard: preferences?.dashboardDensity,
      alertaStockBajo: preferences?.lowStockAlert,
      modoVisual: preferences?.visualMode,
    },
  });
  return toPublicTienda(tienda);
}

function getSistema() {
  return SYSTEM_INFO;
}

export const configuracionService = { getTienda, updateTienda, getSistema };
