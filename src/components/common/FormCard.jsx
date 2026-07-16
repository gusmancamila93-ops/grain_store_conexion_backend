function FormCard({ title, icon, children, actions, className = "" }) {
  return (
    <section className={`gs-card ${className}`.trim()}>
      <header className="flex items-center gap-3 border-b border-border px-6 py-5">
        {icon ? (
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            {icon}
          </span>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
          {title}
        </h2>
      </header>
      <div className="p-6">{children}</div>
      {actions ? <footer className="border-t border-border px-6 py-5">{actions}</footer> : null}
    </section>
  );
}

export default FormCard;
