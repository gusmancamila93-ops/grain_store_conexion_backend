import { Eye, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/common/Modal";
import SearchInput from "@/components/common/SearchInput";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { ventasService } from "@/services/ventasService";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_OPTIONS = ["Todos", "Pagada", "Pendiente", "Anulada"];

function SaleStatus({ status }) {
  return <span className={`gs-sale-status ${status.toLowerCase()}`}>{status}</span>;
}

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  useEffect(() => {
    let active = true;
    ventasService.readSales().then((data) => {
      if (!active) return;
      setSales(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const paidSales = sales.filter((sale) => sale.status === "Pagada");
    const pending = sales.filter((sale) => sale.status === "Pendiente").length;
    const total = paidSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    return { count: sales.length, paid: paidSales.length, pending, total };
  }, [sales]);

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesSearch =
        !term ||
        sale.code.toLowerCase().includes(term) ||
        sale.customer.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "Todos" || sale.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sales, search, statusFilter]);

  async function handleDelete(saleId) {
    await ventasService.deleteSale(saleId);
    setSales((current) => current.filter((sale) => sale.id !== saleId));
  }

  async function handleViewDetail(saleId) {
    const detail = await ventasService.getSaleById(saleId);
    setSelectedSale(detail);
  }

  return (
    <section className="gs-module-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Operación comercial
          </p>
          <h1 className="gs-page-title">Ventas</h1>
        </div>
        <Link className="gs-btn gs-btn-primary" to="nueva">
          <Plus size={17} /> Nueva Venta
        </Link>
      </div>

      <div className="gs-stats-grid">
        <StatCard badge="COP" icon={<ShoppingCart size={24} />} label="Total Vendido" tone="green" value={formatCurrency(stats.total)} />
        <StatCard badge="Registros" icon={<ShoppingCart size={24} />} label="Ventas" tone="blue" value={stats.count} />
        <StatCard badge="Pagadas" icon={<ShoppingCart size={24} />} label="Confirmadas" tone="purple" value={stats.paid} />
        <StatCard badge="Pendientes" icon={<ShoppingCart size={24} />} label="Por Cobrar" tone="orange" value={stats.pending} />
      </div>

      <div className="gs-card gs-card-pad">
        <div className="gs-products-toolbar">
          <div className="gs-products-search">
            <Search size={16} />
            <SearchInput
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código o cliente..."
              value={search}
            />
          </div>
          <label className="gs-filter-control">
            <select className="gs-input" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">Cargando ventas...</p>
        </div>
      ) : sales.length ? (
        <TableCard
          columns={[
            { key: "code", label: "Código" },
            { key: "customer", label: "Cliente" },
            { key: "date", label: "Fecha" },
            { key: "payment", label: "Pago" },
            { key: "total", label: "Total" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          emptyMessage="No hay ventas que coincidan con los filtros aplicados."
          renderRow={(sale) => (
            <>
              <td className="font-bold text-primary">{sale.code}</td>
              <td><strong className="text-foreground">{sale.customer}</strong></td>
              <td className="text-muted-foreground">{formatDate(sale.date)}</td>
              <td className="text-muted-foreground">{sale.paymentMethod}</td>
              <td className="font-heading text-lg font-bold text-foreground">{formatCurrency(sale.total)}</td>
              <td><SaleStatus status={sale.status} /></td>
              <td>
                <div className="gs-row-actions">
                  <button
                    aria-label={`Ver detalle ${sale.code}`}
                    className="gs-action-btn view"
                    onClick={() => handleViewDetail(sale.id)}
                    type="button"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    aria-label={`Eliminar ${sale.code}`}
                    className="gs-action-btn delete"
                    onClick={() => handleDelete(sale.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
          rows={filteredSales}
          title="Tabla de Ventas"
        />
      ) : (
        <div className="gs-card">
          <EmptyState
            icon={<ShoppingCart size={22} />}
            message="Registra la primera venta para comenzar el seguimiento comercial."
            title="Sin ventas"
          />
        </div>
      )}

      <Modal
        footer={
          <button className="gs-btn gs-btn-primary" onClick={() => setSelectedSale(null)} type="button">
            Cerrar Detalle
          </button>
        }
        onClose={() => setSelectedSale(null)}
        open={Boolean(selectedSale)}
        title="Detalle de Venta"
      >
        {selectedSale ? (
          <div className="gs-sale-detail">
            <div className="gs-sale-summary">
              <div>
                <span>Código</span>
                <strong>{selectedSale.code}</strong>
              </div>
              <div>
                <span>Cliente</span>
                <strong>{selectedSale.customer}</strong>
              </div>
              <div>
                <span>Método de pago</span>
                <strong>{selectedSale.paymentMethod}</strong>
              </div>
              <div>
                <span>Total general</span>
                <strong>{formatCurrency(selectedSale.total)}</strong>
              </div>
            </div>
            <div className="gs-sale-items">
              {selectedSale.items.map((item) => (
                <article key={`${selectedSale.id}-${item.product}`}>
                  <div>
                    <strong>{item.product}</strong>
                    <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <b>{formatCurrency(Number(item.quantity) * Number(item.unitPrice))}</b>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default SalesPage;
