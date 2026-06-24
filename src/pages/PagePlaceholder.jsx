function PagePlaceholder({ title }) {
  return (
    <section className="space-y-2">
      <p className="text-sm text-muted-foreground">Base del proyecto</p>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-muted-foreground">
        Pagina reservada para la implementacion del modulo.
      </p>
    </section>
  );
}

export default PagePlaceholder;
