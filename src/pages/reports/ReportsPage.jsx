import { BarChart3, CircleDollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import ChartCard from "@/components/common/ChartCard";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { reportesService } from "@/services/reportesService";
import { formatCurrency } from "@/utils/formatCurrency";

const ICONS = [CircleDollarSign, TrendingDown, TrendingUp, Users];

function formatReportValue(stat) {
  return stat.type === "currency" ? formatCurrency(stat.value) : stat.value;
}

function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    reportesService
      .getReports()
      .then((data) => {
        if (active) setReports(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  if (error) {
    return (
      <section className="gs-module-page">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">No se pudieron cargar los reportes: {error}</p>
          <button className="gs-btn gs-btn-primary mt-4" onClick={() => setReloadToken((n) => n + 1)} type="button">
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (!reports) {
    return (
      <section className="gs-module-page">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </section>
    );
  }

  const max = Math.max(...reports.monthly.flatMap((item) => [item.income, item.expenses]), 1);
  const computedStats = [
    { label: "Ingresos", value: reports.totals.income, type: "currency", badge: "Pagado", tone: "green" },
    { label: "Egresos", value: reports.totals.expenses, type: "currency", badge: "Periodo", tone: "red" },
    { label: "Utilidad estimada", value: reports.totals.profit, type: "currency", badge: "Balance", tone: "blue" },
    { label: "Ventas totales", value: reports.totals.salesCount, badge: "Registros", tone: "orange" },
  ];

  return (
    <section className="gs-module-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Análisis simulado
          </p>
          <h1 className="gs-page-title">Reportes</h1>
        </div>
      </div>

      <div className="gs-stats-grid">
        {computedStats.map((stat, index) => {
          const Icon = ICONS[index] ?? BarChart3;
          return (
            <StatCard
              badge={stat.badge}
              icon={<Icon size={24} />}
              key={stat.label}
              label={stat.label}
              tone={stat.tone}
              value={formatReportValue(stat)}
            />
          );
        })}
      </div>

      <div className="gs-dashboard-grid">
        <TableCard
          columns={[
            { key: "product", label: "Producto" },
            { key: "quantity", label: "Cantidad vendida" },
          ]}
          renderRow={(product) => (
            <>
              <td><strong className="text-foreground">{product.name}</strong></td>
              <td className="font-heading text-lg font-bold text-primary">{product.quantity}</td>
            </>
          )}
          rows={reports.topProducts.slice(0, 5)}
          title="Productos Más Vendidos"
        />
        <TableCard
          columns={[
            { key: "customer", label: "Cliente" },
            { key: "count", label: "Compras" },
          ]}
          renderRow={(customer) => (
            <>
              <td><strong className="text-foreground">{customer.name}</strong></td>
              <td className="font-heading text-lg font-bold text-primary">{customer.count}</td>
            </>
          )}
          rows={reports.frequentCustomers.slice(0, 5)}
          title="Clientes Frecuentes"
        />
      </div>

      <div className="gs-dashboard-grid">
        <ChartCard
          actions={
            <div className="gs-chart-legend">
              <span><i className="primary" /> Ingresos</span>
              <span><i className="secondary" /> Egresos</span>
            </div>
          }
          title="Ingresos vs Egresos"
        >
          <div className="gs-dashboard-chart compact">
            {reports.monthly.map((item) => (
              <div className="gs-chart-month" key={item.label}>
                <div className="gs-chart-bars">
                  <span className="gs-chart-bar secondary" style={{ height: `${(item.expenses / max) * 100}%` }} />
                  <span className="gs-chart-bar" style={{ height: `${(item.income / max) * 100}%` }} />
                </div>
                <span className="gs-chart-label">{item.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <section className="gs-card gs-card-pad">
          <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
            Indicadores
          </h2>
          <div className="gs-indicator-list">
            {reports.indicators.map((indicator) => (
              <article className="gs-indicator" key={indicator.label}>
                <div>
                  <span>{indicator.label}</span>
                  <strong>{indicator.value}</strong>
                </div>
                <p>{indicator.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="gs-dashboard-table">
        <TableCard
          columns={[
            { key: "month", label: "Mes" },
            { key: "income", label: "Ingresos" },
            { key: "expenses", label: "Egresos" },
            { key: "balance", label: "Balance" },
          ]}
          renderRow={(item) => (
            <>
              <td className="font-bold text-primary">{item.label}</td>
              <td>{formatCurrency(item.income)}</td>
              <td className="text-muted-foreground">{formatCurrency(item.expenses)}</td>
              <td className="font-heading text-lg font-bold text-foreground">
                {formatCurrency(item.income - item.expenses)}
              </td>
            </>
          )}
          rows={reports.monthly}
          title="Resumen Financiero"
        />
      </div>
    </section>
  );
}

export default ReportsPage;
