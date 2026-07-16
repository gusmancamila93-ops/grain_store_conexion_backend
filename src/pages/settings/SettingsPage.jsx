import { Camera, Edit3, Plus, Settings, Store, SlidersHorizontal, Trash2, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import FormCard from "@/components/common/FormCard";
import Modal from "@/components/common/Modal";
import Tabs from "@/components/common/Tabs";
import TableCard from "@/components/common/TableCard";
import { configService } from "@/services/configService";
import { usuariosService } from "@/services/usuariosService";
import { ROLES, SETTINGS_TABS } from "@/routes/routeConfig";

const TAB_META = {
  perfil: { label: "Mi Perfil", icon: <User size={16} />, title: "Mi Perfil" },
  sistema: { label: "Sistema", icon: <SlidersHorizontal size={16} />, title: "Sistema" },
  tienda: { label: "Mi Tienda", icon: <Store size={16} />, title: "Mi Tienda" },
  usuarios: { label: "Usuarios", icon: <Users size={16} />, title: "Usuarios" },
};

const EMPTY_USER = {
  email: "",
  name: "",
  role: "Vendedor",
  status: "Activo",
};

const LABELS = {
  address: "Dirección",
  backup: "Copia de seguridad",
  currency: "Moneda",
  dashboardDensity: "Densidad del dashboard",
  email: "Correo",
  language: "Idioma",
  lowStockAlert: "Alerta de bajo stock",
  name: "Nombre",
  nit: "NIT",
  notifications: "Notificaciones",
  phone: "Teléfono",
  version: "Versión",
  visualMode: "Modo visual",
};

function ConfigFields({ data, group, onChange, readOnly = false, exclude = [] }) {
  return (
    <div className="gs-product-form">
      {Object.entries(data).filter(([key]) => !exclude.includes(key)).map(([key, value]) => (
        <label className="gs-field" key={key}>
          <span>{LABELS[key] ?? key}</span>
          <input
            className="gs-input"
            name={key}
            onChange={(event) => onChange?.(group, key, event.target.value)}
            readOnly={readOnly}
            value={value}
          />
        </label>
      ))}
    </div>
  );
}

function UserForm({ form, onChange }) {
  return (
    <div className="gs-product-form">
      <label className="gs-field">
        <span>Nombre *</span>
        <input className="gs-input" name="name" onChange={onChange} required value={form.name} />
      </label>
      <label className="gs-field">
        <span>Correo *</span>
        <input className="gs-input" name="email" onChange={onChange} required type="email" value={form.email} />
      </label>
      <label className="gs-field">
        <span>Rol</span>
        <select className="gs-input" name="role" onChange={onChange} value={form.role}>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Contador">Contador</option>
        </select>
      </label>
      <label className="gs-field">
        <span>Estado</span>
        <select className="gs-input" name="status" onChange={onChange} value={form.status}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </label>
    </div>
  );
}

function SettingsPage() {
  const { role } = useOutletContext();
  const roleLabel = ROLES[role] ?? role;
  const tabs = useMemo(
    () => (SETTINGS_TABS[role] ?? []).map((id) => ({ id, ...TAB_META[id] })),
    [role],
  );
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "perfil");
  const [config, setConfig] = useState(() => configService.readConfig());
  const [profileDraft, setProfileDraft] = useState(() => configService.readConfig().profile);
  const [storeDraft, setStoreDraft] = useState(() => {
    const initialConfig = configService.readConfig();
    return {
      company: initialConfig.company,
      preferences: initialConfig.preferences,
    };
  });
  const [users, setUsers] = useState(() => usuariosService.readUsers());
  const [userForm, setUserForm] = useState(EMPTY_USER);
  const [editingUser, setEditingUser] = useState(null);

  function persistConfig(nextConfig) {
    configService.saveConfig(nextConfig);
    setConfig(nextConfig);
  }

  function updateProfileDraft(_group, key, value) {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  }

  function updateStoreDraft(group, key, value) {
    setStoreDraft((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }));
  }

  function saveProfile(event) {
    event.preventDefault();
    persistConfig({ ...config, profile: profileDraft });
  }

  function cancelProfile() {
    setProfileDraft(config.profile);
  }

  function saveStore(event) {
    event.preventDefault();
    persistConfig({
      ...config,
      company: storeDraft.company,
      preferences: storeDraft.preferences,
    });
  }

  function cancelStore() {
    setStoreDraft({
      company: config.company,
      preferences: config.preferences,
    });
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileDraft((current) => ({ ...current, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function updateUserForm(event) {
    const { name, value } = event.target;
    setUserForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditingUser(event) {
    const { name, value } = event.target;
    setEditingUser((current) => ({ ...current, [name]: value }));
  }

  function createUser(event) {
    event.preventDefault();
    setUsers(usuariosService.createUser(userForm));
    setUserForm(EMPTY_USER);
  }

  function saveUser(event) {
    event.preventDefault();
    setUsers(usuariosService.updateUser(editingUser.id, editingUser));
    setEditingUser(null);
  }

  function deleteUser(userId) {
    setUsers(usuariosService.deleteUser(userId));
  }

  function renderTab() {
    if (activeTab === "perfil") {
      return (
        <FormCard className="gs-product-create-card" icon={<User size={20} />} title="Datos generales">
          <form className="gs-product-form-shell" onSubmit={saveProfile}>
            <div className="gs-profile-settings">
              <div className="gs-photo-control">
                <div className="gs-avatar large">
                  {profileDraft.photo ? (
                    <img alt="Foto de perfil" src={profileDraft.photo} />
                  ) : (
                    profileDraft.name.charAt(0)
                  )}
                </div>
                <label className="gs-photo-button">
                  <Camera size={16} /> Cambiar foto
                  <input accept="image/*" onChange={handlePhotoChange} type="file" />
                </label>
              </div>
              <ConfigFields data={profileDraft} exclude={["photo"]} group="profile" onChange={updateProfileDraft} />
            </div>
            <div className="gs-form-actions gs-settings-actions">
              <button className="gs-btn gs-btn-primary" type="submit">Guardar cambios</button>
              <button className="gs-btn gs-btn-secondary" onClick={cancelProfile} type="button">Cancelar cambios</button>
            </div>
          </form>
        </FormCard>
      );
    }

    if (activeTab === "sistema") {
      return (
        <FormCard className="gs-product-create-card" icon={<SlidersHorizontal size={20} />} title="Preferencias del sistema">
          <ConfigFields data={config.system} group="system" readOnly />
        </FormCard>
      );
    }

    if (activeTab === "tienda") {
      return (
        <FormCard className="gs-product-create-card" icon={<Store size={20} />} title="Información de la empresa">
          <form className="gs-product-form-shell" onSubmit={saveStore}>
            <ConfigFields data={storeDraft.company} group="company" onChange={updateStoreDraft} />
            <div className="mt-6">
              <h3 className="font-heading text-xl font-semibold uppercase text-foreground">Preferencias visuales</h3>
              <div className="mt-4">
                <ConfigFields data={storeDraft.preferences} group="preferences" onChange={updateStoreDraft} />
              </div>
            </div>
            <div className="gs-form-actions gs-settings-actions">
              <button className="gs-btn gs-btn-primary" type="submit">Guardar cambios</button>
              <button className="gs-btn gs-btn-secondary" onClick={cancelStore} type="button">Cancelar cambios</button>
            </div>
          </form>
        </FormCard>
      );
    }

    return (
      <div className="gs-users-settings-section">
        <FormCard className="gs-product-create-card gs-user-create-card" icon={<Users size={20} />} title="Crear Usuario">
          <form className="gs-product-form-shell" onSubmit={createUser}>
            <UserForm form={userForm} onChange={updateUserForm} />
            <div className="gs-form-actions">
              <button className="gs-btn gs-btn-primary" type="submit">
                <Plus size={17} /> Crear Usuario
              </button>
            </div>
          </form>
        </FormCard>

        <TableCard
          columns={[
            { key: "name", label: "Usuario" },
            { key: "email", label: "Correo" },
            { key: "role", label: "Rol" },
            { key: "status", label: "Estado" },
            { key: "actions", label: "Acciones" },
          ]}
          renderRow={(user) => (
            <>
              <td><strong className="text-foreground">{user.name}</strong></td>
              <td className="text-muted-foreground">{user.email}</td>
              <td className="text-muted-foreground">{user.role}</td>
              <td><span className={`gs-customer-status ${user.status.toLowerCase()}`}>{user.status}</span></td>
              <td>
                <div className="gs-row-actions">
                  <button className="gs-action-btn edit" onClick={() => setEditingUser(user)} type="button">
                    <Edit3 size={16} />
                  </button>
                  <button className="gs-action-btn delete" onClick={() => deleteUser(user.id)} type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
          rows={users}
          title="Listado de Usuarios"
        />
      </div>
    );
  }

  return (
    <section className="gs-module-page">
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Panel de {roleLabel}
          </p>
          <h1 className="gs-page-title">
            <Settings className="inline-block align-[-0.08em]" size={34} /> Configuración
          </h1>
        </div>
      </div>
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
      {renderTab()}

      <Modal
        footer={
          <>
            <button className="gs-btn gs-btn-secondary" onClick={() => setEditingUser(null)} type="button">Cancelar</button>
            <button className="gs-btn gs-btn-primary" form="edit-user-form" type="submit">Guardar cambios</button>
          </>
        }
        onClose={() => setEditingUser(null)}
        open={Boolean(editingUser)}
        title="Editar Usuario"
      >
        {editingUser ? (
          <form id="edit-user-form" onSubmit={saveUser}>
            <UserForm form={editingUser} onChange={updateEditingUser} />
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

export default SettingsPage;
