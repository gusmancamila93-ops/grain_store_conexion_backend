import { LockKeyhole, LogIn, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_USERS } from "@/services/authService";
import { ROLE_HOME, ROLES } from "@/routes/routeConfig";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "vendedor", label: "Vendedor" },
  { value: "contador", label: "Contador" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, session } = useAuth();
  const [form, setForm] = useState({
    email: MOCK_USERS[0].email,
    password: MOCK_USERS[0].password,
    role: MOCK_USERS[0].role,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && session?.role) {
      navigate(ROLE_HOME[session.role], { replace: true });
    }
  }, [isAuthenticated, navigate, session]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function fillDemoUser(user) {
    setForm({
      email: user.email,
      password: user.password,
      role: user.role,
    });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const nextSession = await login(form);
      navigate(ROLE_HOME[nextSession.role], { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <section className="gs-auth-shell">
      <div className="gs-auth-brand">
        <p className="gs-auth-kicker">Sistema de gestion</p>
        <h1>Grain Store</h1>
        <p>
          Acceso por roles para administrar clientes, productos, ventas, reportes y
          configuracion segun el perfil asignado.
        </p>
      </div>

      <form className="gs-auth-card" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="gs-auth-icon">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase text-foreground">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Usa uno de los perfiles simulados para entrar al panel correspondiente.
          </p>
        </div>

        <label className="gs-field">
          <span>
            <UserRound size={16} /> Rol
          </span>
          <select className="gs-input" name="role" onChange={updateField} value={form.role}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        <label className="gs-field">
          <span>
            <Mail size={16} /> Correo
          </span>
          <input
            className="gs-input"
            name="email"
            onChange={updateField}
            placeholder="correo@grainstore.com"
            type="email"
            value={form.email}
          />
        </label>

        <label className="gs-field">
          <span>
            <LockKeyhole size={16} /> Contraseña
          </span>
          <input
            className="gs-input"
            name="password"
            onChange={updateField}
            placeholder="Contraseña"
            type="password"
            value={form.password}
          />
        </label>

        {error ? <p className="gs-auth-error">{error}</p> : null}

        <button className="gs-btn gs-btn-primary w-full" type="submit">
          <LogIn size={17} /> Entrar al panel
        </button>

        <div className="gs-demo-users" aria-label="Usuarios simulados">
          {MOCK_USERS.map((user) => (
            <button key={user.id} onClick={() => fillDemoUser(user)} type="button">
              <strong>{ROLES[user.role]}</strong>
              <span>{user.email}</span>
              <small>{user.password}</small>
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}

export default LoginPage;
