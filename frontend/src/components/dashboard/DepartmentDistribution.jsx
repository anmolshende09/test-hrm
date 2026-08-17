import React from "react";
import EmptyState from "../common/EmptyState";

export default function DepartmentDistribution({ departments = [] }) {
  const max = Math.max(1, ...departments.map((d) => d.count));

  if (departments.length === 0) {
    return <EmptyState title="No departments yet" description="Add a department to see the breakdown here." />;
  }

  return (
    <div className="space-y-4">
      {departments.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-caption mb-1.5">
            <span className="text-ink-muted80">{d.name}</span>
            <span className="text-ink-muted48">{d.count}</span>
          </div>
          <div className="h-2 rounded-pill bg-canvas-parchment overflow-hidden">
            <div
              className="h-full bg-primary rounded-pill transition-all duration-300"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
