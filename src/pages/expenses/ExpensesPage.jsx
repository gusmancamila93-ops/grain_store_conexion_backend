import { CircleMinus, Edit3, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import FormCard from "@/components/common/FormCard";
import Modal from "@/components/common/Modal";
import SearchInput from "@/components/common/SearchInput";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { egresosService, EXPENSE_CATEGORIES } from "@/services/egresosService";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const EMPTY_FORM = {
  category: "Compra de mercancía",
  code: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  responsible: "",
  value: 0,
};

function ExpenseForm({ form, onChange }) {
  return (
    <div className="gs-product-form">
      <label className="gs-field">
        <span>Código *</span>
        <input className="gs-input" name="code" onChange={onChange} placeholder="Ej: EGR-004" required value={form.code} />
      </label>
      <label className="gs-field">
        <span>Fecha *</span>
        <input className="gs-input" name="date" onChange={onChange} required type="date" value={form.date} />
      </label>
      <label className="gs-field">
        <span>Categoría *</span>
        <select className="gs-input" name="category" onChange={onChange} value={form.category}>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="gs-field">
        <span>Valor *</span>
        <input className="gs-input" min="0" name="value" onChange={onChange} required type="number" value={form.value} />
      </label>
      <label className="gs-field">
        <span>Responsable *</span>
        <input className="gs-input" name="responsible" onChange={onChange} placeholder="Ej: Administrador" required value={form.responsible} />
      </label>
      <label className="gs-field">
        <span>Descripción *</span>
        <input className="gs-input" name="description" onChange={onChange} placeholder="Detalle del egreso" required value={form.description} />
      </label>
    </div>
  );
}

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    egresosService
      .readExpenses()
      .then((data) => {
        if (!active) return;
        setExpenses(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
    const merchandise = expenses
      .filter((expense) => expense.category === "Compra de mercancía")
      .reduce((sum, expense) => sum + Number(expense.value), 0);
    return { count: expenses.length, merchandise, total };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch =
        !term ||
        expense.code.toLowerCase().includes(term) ||
        expense.description.toLowerCase().includes(term) ||
        expense.responsible.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "Todas" || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, expenses, search]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditing(event) {
    const { name, value } = event.target;
    setEditingExpense((current) => ({ ...current, [name]: value }));
  }

  async function createExpense(event) {
    event.preventDefault();
    const created = await egresosService.createExpense({ ...form, value: Number(form.value) });
    setExpenses((current) => [created, ...current]);
    setForm(EMPTY_FORM);
  }

  async function saveExpense(event) {
    event.preventDefault();
    const updated = await egresosService.updateExpense(editingExpense.id, {
      ...editingExpense,
      value: Number(editingExpense.value),
    });
    setExpenses((current) => current.map((expense) => (expense.id === updated.id ? updated : expense)));
    setEditingExpense(null);
  }

  async function deleteExpense(expenseId) {
    await egresosService.deleteExpense(expenseId);
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
  }

  return (
    <section className="gs-module-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Control financiero
          </p>
          <h1 className="gs-page-title">Egresos</h1>
        </div>
      </div>

      <div className="gs-stats-grid">
        <StatCard badge="Mes" icon={<CircleMinus size={24} />} label="Total Egresos" tone="red" value={formatCurrency(stats.total)} />
        <StatCard badge="Registros" icon={<CircleMinus size={24} />} label="Movimientos" tone="blue" value={stats.count} />
        <StatCard badge="Inventario" icon={<CircleMinus size={24} />} label="Mercancía" tone="orange" value={formatCurrency(stats.merchandise)} />
      </div>

      <FormCard className="gs-product-create-card" icon={<CircleMinus size={20} />} title="Registrar Egreso">
        <form className="gs-product-form-shell" onSubmit={createExpense}>
          <ExpenseForm form={form} onChange={updateForm} />
          <div className="gs-form-actions">
            <button className="gs-btn gs-btn-primary" type="submit">
              <Plus size={17} /> Registrar Egreso
            </button>
          </div>
        </form>
      </FormCard>

      <div className="gs-card gs-card-pad">
        <div className="gs-products-toolbar">
          <div className="gs-products-search">
            <Search size={16} />
            <SearchInput onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, descripción o responsable..." value={search} />
          </div>
          <label className="gs-filter-control">
            <Filter size={16} />
            <select className="gs-input" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
              <option value="Todas">Todas las categorías</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">No se pudieron cargar los egresos: {error}</p>
          <button className="gs-btn gs-btn-primary mt-4" onClick={() => setReloadToken((n) => n + 1)} type="button">
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">Cargando egresos...</p>
        </div>
      ) : expenses.length ? (
        <TableCard
          columns={[
            { key: "code", label: "Código" },
            { key: "date", label: "Fecha" },
            { key: "category", label: "Categoría" },
            { key: "description", label: "Descripción" },
            { key: "value", label: "Valor" },
            { key: "responsible", label: "Responsable" },
            { key: "actions", label: "Acciones" },
          ]}
          emptyMessage="No hay egresos que coincidan con los filtros aplicados."
          renderRow={(expense) => (
            <>
              <td className="font-bold text-primary">{expense.code}</td>
              <td className="text-muted-foreground">{formatDate(expense.date)}</td>
              <td className="text-muted-foreground">{expense.category}</td>
              <td><strong className="text-foreground">{expense.description}</strong></td>
              <td className="font-heading text-lg font-bold text-foreground">{formatCurrency(expense.value)}</td>
              <td className="text-muted-foreground">{expense.responsible}</td>
              <td>
                <div className="gs-row-actions">
                  <button className="gs-action-btn edit" onClick={() => setEditingExpense(expense)} type="button">
                    <Edit3 size={16} />
                  </button>
                  <button className="gs-action-btn delete" onClick={() => deleteExpense(expense.id)} type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
          rows={filteredExpenses}
          title="Tabla de Egresos"
        />
      ) : (
        <div className="gs-card">
          <EmptyState icon={<CircleMinus size={22} />} message="Registra el primer egreso para completar el control financiero." title="Sin egresos" />
        </div>
      )}

      <Modal
        footer={
          <>
            <button className="gs-btn gs-btn-secondary" onClick={() => setEditingExpense(null)} type="button">Cancelar</button>
            <button className="gs-btn gs-btn-primary" form="edit-expense-form" type="submit">Guardar cambios</button>
          </>
        }
        onClose={() => setEditingExpense(null)}
        open={Boolean(editingExpense)}
        title="Editar Egreso"
      >
        {editingExpense ? (
          <form id="edit-expense-form" onSubmit={saveExpense}>
            <ExpenseForm form={editingExpense} onChange={updateEditing} />
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

export default ExpensesPage;
