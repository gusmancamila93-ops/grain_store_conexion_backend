import { useOutletContext } from "react-router-dom";
import { ROLES } from "@/routes/routeConfig";

function PagePlaceholder({ title }) {
  const context = useOutletContext();
  const role = context?.role;
  const roleLabel = ROLES[role] ?? role;

  return (
    <section>
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            {roleLabel ? `Panel de ${roleLabel}` : "Base del proyecto"}
          </p>
          <h1 className="gs-page-title">{title}</h1>
        </div>
      </div>
      <div className="gs-card gs-card-pad">
        <p className="text-muted-foreground">
          Página reservada para la implementación del módulo.
        </p>
      </div>
    </section>
  );
}

export default PagePlaceholder;
