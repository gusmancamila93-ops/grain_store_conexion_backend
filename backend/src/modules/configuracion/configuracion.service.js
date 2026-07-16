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

async function getTienda() {
  const tienda = await prisma.configuracionTienda.findUnique({ where: { id: 1 } });
  if (tienda) return tienda;
  return prisma.configuracionTienda.create({ data: DEFAULT_TIENDA });
}

async function updateTienda(data) {
  await getTienda();
  return prisma.configuracionTienda.update({ where: { id: 1 }, data });
}

function getSistema() {
  return SYSTEM_INFO;
}

export const configuracionService = { getTienda, updateTienda, getSistema };
