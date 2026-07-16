import { Edit3, Filter, Plus, Search, Trash2, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import FormCard from "@/components/common/FormCard";
import Modal from "@/components/common/Modal";
import SearchInput from "@/components/common/SearchInput";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { clientesService } from "@/services/clientesService";

const CUSTOMER_TYPES = ["Minorista", "Mayorista", "Empresa", "Otro"];
const STATUS_OPTIONS = ["Todos", "Activo", "Pendiente", "Inactivo"];

const EMPTY_FORM = {
  address: "",
  document: "",
  email: "",
  name: "",
  phone: "",
  status: "Activo",
  type: "Minorista",
};

function CustomerForm({ form, onChange }) {
  return (
    <div className="gs-customer-form">
      <label className="gs-field">
        <span>Documento / NIT *</span>
        <input
          className="gs-input"
          name="document"
          onChange={onChange}
          placeholder="Ej: 900123456-1"
          required
          value={form.document}
        />
      </label>
      <label className="gs-field">
        <span>Nombre *</span>
        <input
          className="gs-input"
          name="name"
          onChange={onChange}
          placeholder="Ej: Carlos Ruiz"
          required
          value={form.name}
        />
      </label>
      <label className="gs-field">
        <span>Teléfono *</span>
        <input
          className="gs-input"
          name="phone"
          onChange={onChange}
          placeholder="Ej: 300 123 4567"
          required
          value={form.phone}
        />
      </label>
      <label className="gs-field">
        <span>Correo *</span>
        <input
          className="gs-input"
          name="email"
          onChange={onChange}
          placeholder="Ej: cliente@correo.com"
          required
          type="email"
          value={form.email}
        />
      </label>
      <label className="gs-field">
        <span>Dirección *</span>
        <input
          className="gs-input"
          name="address"
          onChange={onChange}
          placeholder="Ej: Cra 5 #12-34, Ibagué"
          required
          value={form.address}
        />
      </label>
      <label className="gs-field">
        <span>Tipo</span>
        <select className="gs-input" name="type" onChange={onChange} value={form.type}>
          {CUSTOMER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="gs-field">
        <span>Estado</span>
        <select className="gs-input" name="status" onChange={onChange} value={form.status}>
          {STATUS_OPTIONS.filter((status) => status !== "Todos").map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CustomerStatus({ status }) {
  return <span className={`gs-customer-status ${status.toLowerCase()}`}>{status}</span>;
}

function CustomersPage() {
  const [customers, setCustomers] = useState(() => clientesService.readCustomers());
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const stats = useMemo(() => {
    const active = customers.filter((customer) => customer.status === "Activo").length;
    const pending = customers.filter((customer) => customer.status === "Pendiente").length;
    const inactive = customers.filter((customer) => customer.status === "Inactivo").length;

    return { active, inactive, pending, total: customers.length };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !term ||
        customer.document.toLowerCase().includes(term) ||
        customer.name.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.address.toLowerCase().includes(term);
      const matchesType = typeFilter === "Todos" || customer.type === typeFilter;
      const matchesStatus = statusFilter === "Todos" || customer.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, search, statusFilter, typeFilter]);

  function updateCreateForm(event) {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditForm(event) {
    const { name, value } = event.target;
    setEditingCustomer((current) => ({ ...current, [name]: value }));
  }

  function handleCreate(event) {
    event.preventDefault();
    const nextCustomers = clientesService.createCustomer(createForm);
    setCustomers(nextCustomers);
    setCreateForm(EMPTY_FORM);
  }

  function handleEdit(event) {
    event.preventDefault();
    const nextCustomers = clientesService.updateCustomer(editingCustomer.id, editingCustomer);
    setCustomers(nextCustomers);
    setEditingCustomer(null);
  }

  function handleDelete(customerId) {
    const nextCustomers = clientesService.deleteCustomer(customerId);
    setCustomers(nextCustomers);
  }

  return (
    <section className="gs-customers-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Cartera Grain Store
          </p>
          <h1 className="gs-page-title">Gestión de Clientes</h1>
        </div>
      </div>

      <div className="gs-stats-grid">
        <StatCard badge="Total" icon={<Users size={24} />} label="Total Clientes" tone="blue" value={stats.total} />
        <StatCard badge="Activos" icon={<Users size={24} />} label="Clientes Activos" tone="green" value={stats.active} />
        <StatCard badge="Revisión" icon={<Users size={24} />} label="Pendientes" tone="orange" value={stats.pending} />
        <StatCard badge="Inactivos" icon={<Users size={24} />} label="Clientes Inactivos" tone="red" value={stats.inactive} />
      </div>

      <FormCard className="gs-customer-create-card" icon={<UserPlus size={20} />} title="Nuevo Cliente">
        <form className="gs-customer-form-shell" id="create-customer-form" onSubmit={handleCreate}>
          <CustomerForm form={createForm} onChange={updateCreateForm} />
          <div className="gs-form-actions">
            <button className="gs-btn gs-btn-primary" type="submit">
              <Plus size={17} /> Crear Cliente
            </button>
          </div>
        </form>
      </FormCard>

      <div className="gs-card gs-card-pad">
        <div className="gs-products-toolbar">
          <div className="gs-products-search">
            <Search size={16} />
            <SearchInput
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por documento, nombre, teléfono o correo..."
              value={search}
            />
          </div>
          <label className="gs-filter-control">
            <Filter size={16} />
            <select
              className="gs-input"
              onChange={(event) => setTypeFilter(event.target.value)}
              value={typeFilter}
            >
              <option value="Todos">Todos los tipos</option>
              {CUSTOMER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="gs-filter-control">
            <Filter size={16} />
            <select
              className="gs-input"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {customers.length ? (
        <TableCard
          columns={[
            { key: "document", label: "Documento / NIT" },
            { key: "name", label: "Cliente" },
            { key: "phone", label: "Teléfono" },
            { key: "email", label: "Correo" },
            { key: "address", label: "Dirección" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          emptyMessage="No hay clientes que coincidan con los filtros aplicados."
          renderRow={(customer) => (
            <>
              <td className="font-bold text-primary">{customer.document}</td>
              <td>
                <strong className="text-foreground">{customer.name}</strong>
                <div className="text-xs font-semibold text-muted-foreground">{customer.type}</div>
              </td>
              <td className="text-muted-foreground">{customer.phone}</td>
              <td className="text-muted-foreground">{customer.email}</td>
              <td className="text-muted-foreground">{customer.address}</td>
              <td><CustomerStatus status={customer.status} /></td>
              <td>
                <div className="gs-row-actions">
                  <button
                    aria-label={`Editar ${customer.name}`}
                    className="gs-action-btn edit"
                    onClick={() => setEditingCustomer(customer)}
                    type="button"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    aria-label={`Eliminar ${customer.name}`}
                    className="gs-action-btn delete"
                    onClick={() => handleDelete(customer.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
          rows={filteredCustomers}
          title="Lista de Clientes"
        />
      ) : (
        <div className="gs-card">
          <EmptyState
            icon={<UserPlus size={22} />}
            message="Registra el primer cliente para comenzar a construir la cartera."
            title="Sin clientes"
          />
        </div>
      )}

      <Modal
        footer={
          <>
            <button className="gs-btn gs-btn-secondary" onClick={() => setEditingCustomer(null)} type="button">
              Cancelar
            </button>
            <button className="gs-btn gs-btn-primary" form="edit-customer-form" type="submit">
              Guardar cambios
            </button>
          </>
        }
        onClose={() => setEditingCustomer(null)}
        open={Boolean(editingCustomer)}
        title="Editar Cliente"
      >
        {editingCustomer ? (
          <form id="edit-customer-form" onSubmit={handleEdit}>
            <CustomerForm form={editingCustomer} onChange={updateEditForm} />
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

export default CustomersPage;
