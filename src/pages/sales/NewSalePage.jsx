import { Save, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import FormCard from "@/components/common/FormCard";
import { clientesService } from "@/services/clientesService";
import { productosService } from "@/services/productosService";
import { ventasService } from "@/services/ventasService";

const EMPTY_FORM = {
  customerId: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "Contado",
  productId: "",
  quantity: 1,
  status: "Pagada",
  unitPrice: 0,
};

function NewSalePage() {
  const navigate = useNavigate();
  const { role } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([clientesService.readCustomers(), productosService.readProducts()])
      .then(([customersData, productsData]) => {
        if (!active) return;
        setCustomers(customersData);
        setProducts(productsData);
        setForm((current) => ({
          ...current,
          customerId: customersData[0]?.id ?? "",
          productId: productsData[0]?.id ?? "",
          unitPrice: productsData[0]?.price ?? 0,
        }));
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

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "productId") {
        const product = products.find((item) => item.id === Number(value));
        return { ...current, productId: Number(value), unitPrice: product?.price ?? current.unitPrice };
      }

      if (name === "customerId") {
        return { ...current, customerId: Number(value) };
      }

      return { ...current, [name]: value };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    try {
      await ventasService.createSale({
        customerId: Number(form.customerId),
        date: form.date,
        paymentMethod: form.paymentMethod,
        status: form.status,
        items: [
          {
            productId: Number(form.productId),
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
          },
        ],
      });
      navigate(`/${role}/ventas`, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (error) {
    return (
      <section className="gs-module-page">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">No se pudo cargar el formulario: {error}</p>
          <button className="gs-btn gs-btn-primary mt-4" onClick={() => setReloadToken((n) => n + 1)} type="button">
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="gs-module-page">
        <div className="gs-card gs-card-pad">
          <p className="text-muted-foreground">Cargando formulario...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="gs-module-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Registro de operación
          </p>
          <h1 className="gs-page-title">Registro de Venta</h1>
        </div>
      </div>

      <FormCard className="gs-product-create-card" icon={<ShoppingCart size={20} />} title="Nueva Venta">
        <form className="gs-product-form-shell" onSubmit={handleSubmit}>
          <div className="gs-product-form">
            <label className="gs-field">
              <span>Cliente *</span>
              <select className="gs-input" name="customerId" onChange={updateForm} value={form.customerId}>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
            <label className="gs-field">
              <span>Fecha *</span>
              <input className="gs-input" name="date" onChange={updateForm} required type="date" value={form.date} />
            </label>
            <label className="gs-field">
              <span>Método de pago</span>
              <select className="gs-input" name="paymentMethod" onChange={updateForm} value={form.paymentMethod}>
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </select>
            </label>
            <label className="gs-field">
              <span>Estado</span>
              <select className="gs-input" name="status" onChange={updateForm} value={form.status}>
                <option value="Pagada">Pagada</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </label>
            <label className="gs-field">
              <span>Producto *</span>
              <select className="gs-input" name="productId" onChange={updateForm} value={form.productId}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <label className="gs-field">
              <span>Cantidad *</span>
              <input className="gs-input" min="1" name="quantity" onChange={updateForm} required type="number" value={form.quantity} />
            </label>
            <label className="gs-field">
              <span>Precio unitario *</span>
              <input className="gs-input" min="0" name="unitPrice" onChange={updateForm} required type="number" value={form.unitPrice} />
            </label>
            <div className="gs-sale-total-preview">
              <span>Total general</span>
              <strong>{new Intl.NumberFormat("es-CO", { currency: "COP", maximumFractionDigits: 0, style: "currency" }).format(Number(form.quantity) * Number(form.unitPrice))}</strong>
            </div>
          </div>
          {submitError && <p className="text-sm font-medium text-destructive" role="alert">{submitError}</p>}
          <div className="gs-form-actions">
            <button className="gs-btn gs-btn-primary" type="submit">
              <Save size={17} /> Guardar Venta
            </button>
          </div>
        </form>
      </FormCard>
    </section>
  );
}

export default NewSalePage;
