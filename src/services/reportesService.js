import { egresosService } from "@/services/egresosService";
import { ventasService } from "@/services/ventasService";

export const reportesMock = {
  stats: [
    { label: "Ventas Totales", value: 18450000, type: "currency", badge: "Mes", tone: "green" },
    { label: "Egresos", value: 7250000, type: "currency", badge: "Mes", tone: "red" },
    { label: "Utilidad", value: 11200000, type: "currency", badge: "Balance", tone: "blue" },
    { label: "Clientes con deuda", value: 7, badge: "Alerta", tone: "orange" },
  ],
  indicators: [
    { label: "Margen neto", value: "61%", detail: "Utilidad estimada del periodo" },
    { label: "Producto líder", value: "Arroz", detail: "Mayor rotación mensual" },
    { label: "Ticket promedio", value: "$146.429", detail: "Promedio por venta" },
  ],
  monthly: [
    { label: "Ene", income: 12, expenses: 5 },
    { label: "Feb", income: 14, expenses: 6 },
    { label: "Mar", income: 13, expenses: 7 },
    { label: "Abr", income: 16, expenses: 8 },
    { label: "May", income: 18, expenses: 9 },
    { label: "Jun", income: 21, expenses: 10 },
  ],
};

export const reportesService = {
  getReports() {
    const sales = ventasService.readSales();
    const expenses = egresosService.readExpenses();
    const income = sales
      .filter((sale) => sale.status === "Pagada")
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
    const productMap = new Map();
    const customerMap = new Map();

    sales.forEach((sale) => {
      customerMap.set(sale.customer, (customerMap.get(sale.customer) ?? 0) + 1);
      sale.items?.forEach((item) => {
        productMap.set(item.product, (productMap.get(item.product) ?? 0) + Number(item.quantity));
      });
    });

    return {
      ...reportesMock,
      frequentCustomers: [...customerMap.entries()]
        .map(([name, count]) => ({ count, name }))
        .sort((a, b) => b.count - a.count),
      topProducts: [...productMap.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity),
      totals: {
        expenses: expenseTotal,
        income,
        profit: income - expenseTotal,
        salesCount: sales.length,
      },
    };
  },
};
