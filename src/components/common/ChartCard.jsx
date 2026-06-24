function ChartCard({ title, children, actions }) {
  return (
    <section className="gs-card gs-card-pad">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
          {title}
        </h2>
        {actions}
      </div>
      <div className="min-h-64">{children}</div>
    </section>
  );
}

export default ChartCard;
