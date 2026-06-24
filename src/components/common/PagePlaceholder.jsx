function PagePlaceholder({ title, description = "Estructura base pendiente de implementacion." }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export default PagePlaceholder;
