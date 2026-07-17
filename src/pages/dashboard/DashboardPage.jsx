import {
  ArrowDownCircle,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ChartCard from "@/components/common/ChartCard";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { dashboardService } from "@/services/dashboardService";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const ICONS = {
  balance: TrendingUp,
  customers: Users,
  expense: ArrowDownCircle,
  income: CircleDollarSign,
  receipt: ReceiptText,
  sales: ShoppingCart,
  stock: Boxes,
};

function formatValue(stat) {
  return stat.type === "currency" ? formatCurrency(stat.value) : stat.value;
}

function DashboardBars({ data, dual = false }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.value, item.secondary ?? 0]));

  return (
    <div className="gs-dashboard-chart" aria-label="Gráfica de actividad mensual">
      {data.map((item) => (
        <div className="gs-chart-month" key={item.label}>
          <div className="gs-chart-bars">
            {dual ? (
              <span
                className="gs-chart-bar secondary"
                style={{ height: `${(item.secondary / maxValue) * 100}%` }}
                title={`Egresos ${item.label}`}
              />
            ) : null}
            <span
              className="gs-chart-bar"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`Actividad ${item.label}`}
            />
          </div>
          <span className="gs-chart-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardPage() {
  const { role } = useOutletContext();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    dashboardService
      .getDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [role, reloadToken]);

  if (error) {
    return (
      <section className="gs-dashboard">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">No se pudo cargar el panel: {error}</p>
          <button className="gs-btn gs-btn-primary mt-4" onClick={() => setReloadToken((n) => n + 1)} type="button">
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="gs-dashboard">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">Cargando panel...</p>
        </div>
      </section>
    );
  }

  const isAccounting = role === "contador";

  return (
    <section className="gs-dashboard">
      <div className="gs-welcome-banner">
        <div className="gs-welcome-text">
          <h1>{dashboard.title}</h1>
          <p>{dashboard.subtitle}</p>
        </div>
        <div className="gs-welcome-icon" aria-hidden="true">
          <BarChart3 size={64} />
        </div>
      </div>

      <div className="gs-stats-grid">
        {dashboard.stats.map((stat) => {
          const Icon = ICONS[stat.icon] ?? BarChart3;

          return (
            <StatCard
              badge={stat.badge}
              detail={stat.detail}
              icon={<Icon size={24} />}
              key={stat.label}
              label={stat.label}
              tone={stat.tone}
              value={formatValue(stat)}
            />
          );
        })}
      </div>

      <div className="gs-dashboard-grid">
        <ChartCard
          actions={
            isAccounting ? (
              <div className="gs-chart-legend">
                <span><i className="primary" /> Ingresos</span>
                <span><i className="secondary" /> Egresos</span>
              </div>
            ) : null
          }
          title={dashboard.chartTitle}
        >
          <DashboardBars data={dashboard.chartSeries} dual={isAccounting} />
        </ChartCard>

        <section className="gs-card gs-card-pad">
          <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
            Indicadores
          </h2>
          <div className="gs-indicator-list">
            {dashboard.indicators.map((indicator) => (
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
            { key: "date", label: "Fecha" },
            { key: "customer", label: "Cliente" },
            { key: "amount", label: "Monto" },
          ]}
          renderRow={(row) => (
            <>
              <td className="font-semibold text-foreground">{formatDate(row.date)}</td>
              <td className="text-muted-foreground">{row.customer}</td>
              <td className="font-heading text-lg font-bold text-primary">
                {formatCurrency(row.amount)}
              </td>
            </>
          )}
          rows={dashboard.movements ?? []}
          title={dashboard.tableTitle}
        />
      </div>
    </section>
  );
}

export default DashboardPage;
