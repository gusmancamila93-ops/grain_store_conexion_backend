import EmptyState from "@/components/common/EmptyState";

function TableCard({ title, columns = [], rows = [], renderRow, emptyMessage }) {
  return (
    <section className="gs-card overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
          {title}
        </h2>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th className="px-6 py-4 font-bold" key={column.key ?? column}>
                    {column.label ?? column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className="border-t border-border transition-colors hover:bg-primary/5" key={row.id ?? index}>
                  {renderRow ? renderRow(row, index) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message={emptyMessage ?? "No hay datos para mostrar."} />
      )}
    </section>
  );
}

export default TableCard;
