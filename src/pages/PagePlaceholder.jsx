function PagePlaceholder({ title }) {
  return (
    <section>
      <div className="gs-page-header">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
            Base del proyecto
          </p>
          <h1 className="gs-page-title">{title}</h1>
        </div>
      </div>
      <div className="gs-card gs-card-pad">
        <p className="text-muted-foreground">
          Pagina reservada para la implementacion del modulo.
        </p>
      </div>
    </section>
  );
}

export default PagePlaceholder;
