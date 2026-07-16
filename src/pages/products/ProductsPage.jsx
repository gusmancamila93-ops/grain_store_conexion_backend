import { Edit3, Filter, PackagePlus, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import FormCard from "@/components/common/FormCard";
import Modal from "@/components/common/Modal";
import SearchInput from "@/components/common/SearchInput";
import StatCard from "@/components/common/StatCard";
import TableCard from "@/components/common/TableCard";
import { productosService } from "@/services/productosService";
import { formatCurrency } from "@/utils/formatCurrency";

const CATEGORIES = [
  "Arroz",
  "Frijol",
  "Maíz",
  "Lenteja",
  "Garbanzo",
  "Trigo",
  "Quinoa",
  "Avena",
  "Soya",
  "Dulcería",
  "Bebida",
  "Otro",
];

const STATUS_OPTIONS = ["Todos", "Normal", "Bajo stock", "Agotado"];

const EMPTY_FORM = {
  category: "Arroz",
  code: "",
  minStock: 5,
  name: "",
  price: 0,
  stock: 0,
};

function normalizeProduct(product) {
  return {
    ...product,
    minStock: Number(product.minStock),
    price: Number(product.price),
    stock: Number(product.stock),
  };
}

function ProductForm({ form, onChange }) {
  return (
    <div className="gs-product-form">
      <label className="gs-field">
        <span>Código *</span>
        <input
          className="gs-input"
          name="code"
          onChange={onChange}
          placeholder="Ej: ARR-001"
          required
          value={form.code}
        />
      </label>
      <label className="gs-field">
        <span>Nombre del Producto *</span>
        <input
          className="gs-input"
          name="name"
          onChange={onChange}
          placeholder="Ej: Arroz Diana"
          required
          value={form.name}
        />
      </label>
      <label className="gs-field">
        <span>Categoría *</span>
        <select className="gs-input" name="category" onChange={onChange} value={form.category}>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="gs-field">
        <span>Stock *</span>
        <input
          className="gs-input"
          min="0"
          name="stock"
          onChange={onChange}
          placeholder="0"
          required
          type="number"
          value={form.stock}
        />
      </label>
      <label className="gs-field">
        <span>Stock mínimo *</span>
        <input
          className="gs-input"
          min="0"
          name="minStock"
          onChange={onChange}
          placeholder="5"
          required
          type="number"
          value={form.minStock}
        />
      </label>
      <label className="gs-field">
        <span>Precio (COP) *</span>
        <input
          className="gs-input"
          min="0"
          name="price"
          onChange={onChange}
          placeholder="0"
          required
          type="number"
          value={form.price}
        />
      </label>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(" ", "-");
  return <span className={`gs-product-status ${className}`}>{status}</span>;
}

function ProductsPage() {
  const [products, setProducts] = useState(() => productosService.readProducts());
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const stats = useMemo(() => {
    const normal = products.filter((product) => productosService.getStatus(product) === "Normal").length;
    const low = products.filter((product) => productosService.getStatus(product) === "Bajo stock").length;
    const empty = products.filter((product) => productosService.getStatus(product) === "Agotado").length;

    return { empty, low, normal, total: products.length };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const status = productosService.getStatus(product);
      const matchesSearch =
        !term ||
        product.code.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "Todas" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "Todos" || status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, products, search, statusFilter]);

  function updateCreateForm(event) {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditForm(event) {
    const { name, value } = event.target;
    setEditingProduct((current) => ({ ...current, [name]: value }));
  }

  function handleCreate(event) {
    event.preventDefault();
    const nextProducts = productosService.createProduct(normalizeProduct(createForm));
    setProducts(nextProducts);
    setCreateForm(EMPTY_FORM);
  }

  function handleEdit(event) {
    event.preventDefault();
    const nextProducts = productosService.updateProduct(
      editingProduct.id,
      normalizeProduct(editingProduct),
    );
    setProducts(nextProducts);
    setEditingProduct(null);
  }

  function handleDelete(productId) {
    const nextProducts = productosService.deleteProduct(productId);
    setProducts(nextProducts);
  }

  return (
    <section className="gs-products-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Inventario Grain Store
          </p>
          <h1 className="gs-page-title">Gestión de Productos</h1>
        </div>
      </div>

      <div className="gs-stats-grid">
        <StatCard badge="Total" icon={<PackagePlus size={24} />} label="Total Productos" tone="blue" value={stats.total} />
        <StatCard badge="Normal" icon={<PackagePlus size={24} />} label="Stock Normal" tone="green" value={stats.normal} />
        <StatCard badge="Alerta" icon={<PackagePlus size={24} />} label="Bajo Stock" tone="orange" value={stats.low} />
        <StatCard badge="Crítico" icon={<PackagePlus size={24} />} label="Agotados" tone="red" value={stats.empty} />
      </div>

      <FormCard
        className="gs-product-create-card"
        icon={<PackagePlus size={20} />}
        title="Registrar Producto"
      >
        <form className="gs-product-form-shell" id="create-product-form" onSubmit={handleCreate}>
          <ProductForm form={createForm} onChange={updateCreateForm} />
          <div className="gs-form-actions">
            <button className="gs-btn gs-btn-primary" type="submit">
              <Plus size={17} /> Registrar Producto
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
              placeholder="Buscar por código, nombre o categoría..."
              value={search}
            />
          </div>
          <label className="gs-filter-control">
            <Filter size={16} />
            <select
              className="gs-input"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
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

      {products.length ? (
        <TableCard
          columns={[
            { key: "code", label: "Código" },
            { key: "name", label: "Producto" },
            { key: "category", label: "Categoría" },
            { key: "price", label: "Precio" },
            { key: "stock", label: "Stock" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          emptyMessage="No hay productos que coincidan con los filtros aplicados."
          renderRow={(product) => {
            const status = productosService.getStatus(product);

            return (
              <>
                <td className="font-bold text-primary">{product.code}</td>
                <td>
                  <strong className="text-foreground">{product.name}</strong>
                </td>
                <td className="text-muted-foreground">{product.category}</td>
                <td className="font-heading text-lg font-bold text-foreground">
                  {formatCurrency(product.price)}
                </td>
                <td className="text-muted-foreground">
                  {product.stock} / min. {product.minStock}
                </td>
                <td><StatusBadge status={status} /></td>
                <td>
                  <div className="gs-row-actions">
                    <button
                      aria-label={`Editar ${product.name}`}
                      className="gs-action-btn edit"
                      onClick={() => setEditingProduct(product)}
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      aria-label={`Eliminar ${product.name}`}
                      className="gs-action-btn delete"
                      onClick={() => handleDelete(product.id)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </>
            );
          }}
          rows={filteredProducts}
          title="Lista de Productos"
        />
      ) : (
        <div className="gs-card">
          <EmptyState
            icon={<PackagePlus size={22} />}
            message="Registra el primer producto para comenzar a construir el inventario."
            title="Sin productos"
          />
        </div>
      )}

      <Modal
        footer={
          <>
            <button className="gs-btn gs-btn-secondary" onClick={() => setEditingProduct(null)} type="button">
              Cancelar
            </button>
            <button className="gs-btn gs-btn-primary" form="edit-product-form" type="submit">
              Guardar cambios
            </button>
          </>
        }
        onClose={() => setEditingProduct(null)}
        open={Boolean(editingProduct)}
        title="Editar Producto"
      >
        {editingProduct ? (
          <form id="edit-product-form" onSubmit={handleEdit}>
            <ProductForm form={editingProduct} onChange={updateEditForm} />
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

export default ProductsPage;
