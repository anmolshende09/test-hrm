import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

/**
 * Table — a thin, columns-driven data table.
 * columns: [{ key, header, render?(row) }]
 */
export default function Table({ columns, data, loading, emptyTitle, emptyDescription, rowKey = "_id" }) {
  if (loading) return <LoadingSpinner label="Loading records…" />;
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle || "No records found"} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((col) => (
              <th key={col.key} className="text-caption-strong text-ink-muted48 pb-3 pr-4 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
               <tbody>
  {data.map((row, index) => (
    <tr
      key={row[rowKey]}
      className="border-b border-divider-soft last:border-0 hover:bg-canvas-parchment/60"
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className="py-3.5 pr-4 text-body align-middle"
        >
          {col.render
            ? col.render(row, index)
            : row[col.key]}
        </td>
      ))}
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}
