import { prisma } from "#config/db.js";
import { MONTH_LABELS, sumByMonth, isSameMonth, isSameDay } from "#utils/monthly.js";

async function buildMovements() {
  const ventas = await prisma.venta.findMany({
    take: 5,
    orderBy: { fecha: "desc" },
    include: { cliente: true },
  });
  return ventas.map((venta) => ({
    id: venta.id,
    date: venta.fecha.toISOString().slice(0, 10),
    customer: venta.cliente.nombre,
    amount: Number(venta.total),
  }));
}

async function buildAdminDashboard() {
  const [ventasPagadas, productos, clientes] = await Promise.all([
    prisma.venta.findMany({ where: { estado: "Pagada" } }),
    prisma.producto.findMany(),
    prisma.cliente.findMany(),
  ]);

  const ventasHoy = ventasPagadas.filter((venta) => isSameDay(venta.fecha));
  const ventasMes = ventasPagadas.filter((venta) => isSameMonth(venta.fecha));
  const bajoStock = productos.filter((producto) => producto.stock <= producto.stockMinimo).length;
  const clientesActivos = clientes.filter((cliente) => cliente.estado === "Activo").length;

  const sums = sumByMonth(ventasPagadas, (v) => v.fecha, () => 1);
  const ticketPromedio = ventasMes.length
    ? ventasMes.reduce((sum, v) => sum + Number(v.total), 0) / ventasMes.length
    : 0;

  return {
    title: "Bienvenido, Administrador",
    subtitle: "Resumen general de ventas, inventario y actividad reciente de Grain Store.",
    stats: [
      { label: "Ventas del Dia", value: ventasHoy.reduce((s, v) => s + Number(v.total), 0), type: "currency", badge: "Hoy", icon: "sales", tone: "green" },
      { label: "Productos Bajo Stock", value: bajoStock, badge: "Alerta", icon: "stock", tone: "red" },
      { label: "Ingresos Mensuales", value: ventasMes.reduce((s, v) => s + Number(v.total), 0), type: "currency", badge: "Mes", icon: "income", tone: "purple" },
      { label: "Clientes Activos", value: clientesActivos, badge: "Total", icon: "customers", tone: "blue" },
    ],
    chartTitle: "Resumen de Actividad",
    chartSeries: MONTH_LABELS.map((label, index) => ({ label, value: sums[index] })),
    indicators: [
      { label: "Ventas registradas", value: String(ventasMes.length), detail: "Operaciones del mes" },
      { label: "Ticket promedio", value: `$${Math.round(ticketPromedio).toLocaleString("es-CO")}`, detail: "Promedio por compra" },
      { label: "Rotacion inventario", value: bajoStock > 0 ? "Atención" : "Estable", detail: "Granos de mayor demanda" },
    ],
    tableTitle: "Movimientos Recientes",
    movements: await buildMovements(),
  };
}

async function buildVendedorDashboard(usuarioId) {
  const ventas = await prisma.venta.findMany({
    where: { usuarioId, estado: "Pagada" },
    include: { cliente: true, items: { include: { producto: true } } },
  });

  const ventasHoy = ventas.filter((venta) => isSameDay(venta.fecha));
  const ventasMes = ventas.filter((venta) => isSameMonth(venta.fecha));
  const clientesAtendidos = new Set(ventas.map((venta) => venta.clienteId)).size;

  const productCounts = new Map();
  ventas.forEach((venta) => {
    venta.items.forEach((item) => {
      productCounts.set(item.producto.nombre, (productCounts.get(item.producto.nombre) ?? 0) + item.cantidad);
    });
  });
  const productoLider = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin datos";

  const sums = sumByMonth(ventas, (v) => v.fecha, () => 1);

  return {
    title: "Bienvenido, Vendedor",
    subtitle: "Seguimiento de ventas personales, clientes atendidos y registros recientes.",
    stats: [
      { label: "Mis Ventas del Dia", value: ventasHoy.reduce((s, v) => s + Number(v.total), 0), type: "currency", badge: "Hoy", icon: "sales", tone: "green" },
      { label: "Mis Ventas del Mes", value: ventasMes.reduce((s, v) => s + Number(v.total), 0), type: "currency", badge: "Mes", icon: "income", tone: "purple" },
      { label: "Clientes Atendidos", value: clientesAtendidos, badge: "Total", icon: "customers", tone: "blue" },
      { label: "Ventas Registradas", value: ventas.length, badge: "Registros", icon: "receipt", tone: "orange" },
    ],
    chartTitle: "Mi Actividad de Ventas",
    chartSeries: MONTH_LABELS.map((label, index) => ({ label, value: sums[index] })),
    indicators: [
      { label: "Meta mensual", value: ventasMes.length ? "En curso" : "Sin ventas", detail: "Avance estimado" },
      { label: "Clientes nuevos", value: String(clientesAtendidos), detail: "Atendidos por mí" },
      { label: "Producto lider", value: productoLider, detail: "Mayor volumen" },
    ],
    tableTitle: "Mis Ventas Recientes",
    movements: ventas
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 5)
      .map((venta) => ({ id: venta.id, date: venta.fecha.toISOString().slice(0, 10), customer: venta.cliente.nombre, amount: Number(venta.total) })),
  };
}

async function buildContadorDashboard() {
  const [ventasPagadas, egresos] = await Promise.all([
    prisma.venta.findMany({ where: { estado: "Pagada" } }),
    prisma.egreso.findMany(),
  ]);

  const ventasHoy = ventasPagadas.filter((venta) => isSameDay(venta.fecha));
  const ventasMes = ventasPagadas.filter((venta) => isSameMonth(venta.fecha));
  const egresosMes = egresos.filter((egreso) => isSameMonth(egreso.fecha));

  const ingresosMes = ventasMes.reduce((s, v) => s + Number(v.total), 0);
  const egresosMesTotal = egresosMes.reduce((s, e) => s + Number(e.valor), 0);

  const ingresosSums = sumByMonth(ventasPagadas, (v) => v.fecha, (v) => Number(v.total));
  const egresosSums = sumByMonth(egresos, (e) => e.fecha, (e) => Number(e.valor));

  return {
    title: "Bienvenido, Contador",
    subtitle: "Balance financiero con ingresos, egresos y utilidad mensual.",
    stats: [
      { label: "Ingresos del Dia", value: ventasHoy.reduce((s, v) => s + Number(v.total), 0), type: "currency", badge: "Hoy", icon: "income", tone: "green" },
      { label: "Ingresos del Mes", value: ingresosMes, type: "currency", badge: "Mes", icon: "sales", tone: "purple" },
      { label: "Egresos del Mes", value: egresosMesTotal, type: "currency", badge: "Mes", icon: "expense", tone: "red" },
      { label: "Utilidad del Mes", value: ingresosMes - egresosMesTotal, type: "currency", badge: "Balance", icon: "balance", tone: "blue" },
    ],
    chartTitle: "Ingresos vs Egresos",
    chartSeries: MONTH_LABELS.map((label, index) => ({ label, value: ingresosSums[index], secondary: egresosSums[index] })),
    indicators: [
      { label: "Margen estimado", value: ingresosMes > 0 ? `${Math.round(((ingresosMes - egresosMesTotal) / ingresosMes) * 100)}%` : "0%", detail: "Utilidad sobre ingresos" },
      { label: "Egresos fijos", value: `$${Math.round(egresosMesTotal).toLocaleString("es-CO")}`, detail: "Servicios y compras" },
      { label: "Cartera activa", value: String(ventasPagadas.length), detail: "Ventas registradas" },
    ],
    tableTitle: "Movimientos Recientes",
    movements: await buildMovements(),
  };
}

async function getDashboard(user) {
  if (user.rol === "vendedor") return buildVendedorDashboard(user.id);
  if (user.rol === "contador") return buildContadorDashboard();
  return buildAdminDashboard();
}

export const dashboardService = { getDashboard };
