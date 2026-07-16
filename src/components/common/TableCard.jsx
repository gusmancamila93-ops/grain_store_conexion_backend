import EmptyState from "@/components/common/EmptyState";

function TableCard({ title, columns = [], rows = [], renderRow, emptyMessage }) {
  return (
    <section className="gs-card gs-table-card">
      <div className="gs-table-card-header">
        <h2 className="font-heading text-2xl font-semibold uppercase text-foreground">
          {title}
        </h2>
      </div>
      {rows.length ? (
        <div className="gs-table-scroll">
          <table className="gs-data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key ?? column}>
                    {column.label ?? column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? index}>
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
