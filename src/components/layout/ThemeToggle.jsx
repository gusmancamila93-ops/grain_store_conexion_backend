import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/services/storage";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(STORAGE_KEYS.theme) ?? "light";
  });
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [isDark, theme]);

  return (
    <button
      aria-label="Cambiar tema"
      className="gs-theme-toggle"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      type="button"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
    </button>
  );
}

export default ThemeToggle;
