import React from "react";
import EmptyState from "../common/EmptyState";
import { titleCase } from "../../utils/format";

const STATUS_COLORS = {
  available: "bg-success",
  assigned: "bg-primary",
  under_maintenance: "bg-warning",
  retired: "bg-ink-muted48",
};

export default function AssetStatusChart({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));

  if (total === 0) {
    return <EmptyState title="No assets yet" description="Add an asset to see the status breakdown here." />;
  }

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.status}>
          <div className="flex justify-between text-caption mb-1.5">
            <span className="text-ink-muted80">{titleCase(d.status)}</span>
            <span className="text-ink-muted48">{d.count}</span>
          </div>
          <div className="h-2 rounded-pill bg-canvas-parchment overflow-hidden">
            <div
              className={`h-full rounded-pill transition-all duration-300 ${STATUS_COLORS[d.status] || "bg-primary"}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
