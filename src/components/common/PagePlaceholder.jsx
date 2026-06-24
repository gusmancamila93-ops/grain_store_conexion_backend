function PagePlaceholder({ title, description = "Estructura base pendiente de implementacion." }) {
  return (
    <section className="gs-card gs-card-pad">
      <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </section>
  );
}

export default PagePlaceholder;
