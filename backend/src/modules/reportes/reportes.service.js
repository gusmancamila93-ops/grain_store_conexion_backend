import { prisma } from "#config/db.js";
import { MONTH_LABELS, sumByMonth } from "#utils/monthly.js";

async function getReports() {
  const [ventas, egresos] = await Promise.all([
    prisma.venta.findMany({
      include: { cliente: true, items: { include: { producto: true } } },
    }),
    prisma.egreso.findMany(),
  ]);

  const ventasPagadas = ventas.filter((venta) => venta.estado === "Pagada");
  const income = ventasPagadas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const expenseTotal = egresos.reduce((sum, egreso) => sum + Number(egreso.valor), 0);

  const productMap = new Map();
  const customerMap = new Map();
  ventas.forEach((venta) => {
    customerMap.set(venta.cliente.nombre, (customerMap.get(venta.cliente.nombre) ?? 0) + 1);
    venta.items.forEach((item) => {
      productMap.set(item.producto.nombre, (productMap.get(item.producto.nombre) ?? 0) + item.cantidad);
    });
  });

  const clientesConDeuda = new Set(
    ventas.filter((venta) => venta.estado === "Pendiente").map((venta) => venta.clienteId),
  ).size;

  const ingresosSums = sumByMonth(ventasPagadas, (v) => v.fecha, (v) => Number(v.total));
  const egresosSums = sumByMonth(egresos, (e) => e.fecha, (e) => Number(e.valor));
  const ticketPromedio = ventasPagadas.length ? income / ventasPagadas.length : 0;
  const margenNeto = income > 0 ? Math.round(((income - expenseTotal) / income) * 100) : 0;
  const topProduct = [...productMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin datos";

  return {
    stats: [
      { label: "Ventas Totales", value: income, type: "currency", badge: "Histórico", tone: "green" },
      { label: "Egresos", value: expenseTotal, type: "currency", badge: "Histórico", tone: "red" },
      { label: "Utilidad", value: income - expenseTotal, type: "currency", badge: "Balance", tone: "blue" },
      { label: "Clientes con deuda", value: clientesConDeuda, badge: "Alerta", tone: "orange" },
    ],
    indicators: [
      { label: "Margen neto", value: `${margenNeto}%`, detail: "Utilidad estimada del periodo" },
      { label: "Producto líder", value: topProduct, detail: "Mayor rotación histórica" },
      { label: "Ticket promedio", value: `$${Math.round(ticketPromedio).toLocaleString("es-CO")}`, detail: "Promedio por venta" },
    ],
    monthly: MONTH_LABELS.map((label, index) => ({
      label,
      income: ingresosSums[index],
      expenses: egresosSums[index],
    })),
    topProducts: [...productMap.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity),
    frequentCustomers: [...customerMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    totals: {
      income,
      expenses: expenseTotal,
      profit: income - expenseTotal,
      salesCount: ventas.length,
    },
  };
}

export const reportesService = { getReports };
