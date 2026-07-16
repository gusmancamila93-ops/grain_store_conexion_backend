function EmptyState({ icon, title = "Sin registros", message = "Aún no hay información disponible." }) {
  return (
    <div className="grid min-h-40 place-items-center px-6 py-10 text-center">
      <div>
        {icon ? (
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <h3 className="font-heading text-xl font-semibold uppercase text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default EmptyState;
