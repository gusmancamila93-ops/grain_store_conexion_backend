import { Save, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormCard from "@/components/common/FormCard";
import { clientesService } from "@/services/clientesService";
import { productosService } from "@/services/productosService";
import { ventasService } from "@/services/ventasService";

const EMPTY_FORM = {
  customer: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "Contado",
  product: "",
  quantity: 1,
  status: "Pagada",
  unitPrice: 0,
};

function NewSalePage() {
  const navigate = useNavigate();
  const customers = clientesService.readCustomers();
  const products = productosService.readProducts();
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    customer: customers[0]?.name ?? "",
    product: products[0]?.name ?? "",
    unitPrice: products[0]?.price ?? 0,
  }));

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "product") {
        const product = products.find((item) => item.name === value);
        return { ...current, product: value, unitPrice: product?.price ?? current.unitPrice };
      }

      return { ...current, [name]: value };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    ventasService.createSale({
      ...form,
      code: `VEN-${Date.now().toString().slice(-5)}`,
      items: [
        {
          product: form.product,
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
        },
      ],
    });
    navigate("..", { replace: true });
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
              <select className="gs-input" name="customer" onChange={updateForm} value={form.customer}>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.name}>{customer.name}</option>
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
              <select className="gs-input" name="product" onChange={updateForm} value={form.product}>
                {products.map((product) => (
                  <option key={product.id} value={product.name}>{product.name}</option>
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
