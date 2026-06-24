function StatCard({ label, value, icon, detail, tone = "default" }) {
  return (
    <article className="gs-card gs-card-pad" data-tone={tone}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <strong className="mt-2 block font-heading text-3xl font-bold uppercase text-foreground">
            {value}
          </strong>
        </div>
        {icon ? (
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            {icon}
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm text-muted-foreground">{detail}</p> : null}
    </article>
  );
}

export default StatCard;
