const CONFIG_KEY = "config_grain_store";

export const defaultConfig = {
  profile: {
    email: "usuario@grainstore.com",
    name: "Usuario Grain Store",
    phone: "300 123 4567",
    photo: "",
  },
  company: {
    address: "Cra 5 #12-34, Ibagué",
    email: "contacto@grainstore.com",
    name: "Grain Store",
    nit: "900123456-1",
    phone: "300 123 4567",
  },
  preferences: {
    currency: "COP",
    dashboardDensity: "Cómoda",
    lowStockAlert: "10 unidades",
    visualMode: "Claro / Oscuro",
  },
  system: {
    backup: "Semanal",
    language: "Español",
    notifications: "Activas",
    version: "1.0 académico",
  },
};

function readConfig() {
  try {
    const value = window.localStorage.getItem(CONFIG_KEY);
    const storedConfig = value ? JSON.parse(value) : {};
    return {
      company: { ...defaultConfig.company, ...storedConfig.company },
      preferences: { ...defaultConfig.preferences, ...storedConfig.preferences },
      profile: { ...defaultConfig.profile, ...storedConfig.profile },
      system: { ...defaultConfig.system, ...storedConfig.system },
    };
  } catch {
    return defaultConfig;
  }
}

function saveConfig(config) {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  return config;
}

export const configService = {
  readConfig,
  saveConfig,
};
