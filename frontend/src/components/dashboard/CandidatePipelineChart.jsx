import React from "react";
import EmptyState from "../common/EmptyState";
import { titleCase } from "../../utils/format";

const STAGE_COLORS = {
  applied: "bg-ink-muted48",
  screening: "bg-primary/60",
  interview: "bg-primary/80",
  offer: "bg-primary",
  hired: "bg-success",
};

export default function CandidatePipelineChart({ data = [], rejectedCount = 0 }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) + rejectedCount;
  const max = Math.max(1, ...data.map((d) => d.count));

  if (total === 0) {
    return <EmptyState title="No candidates yet" description="Candidates will move through this pipeline as they're added." />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.status}>
            <div className="flex justify-between text-caption mb-1.5">
              <span className="text-ink-muted80">{titleCase(d.status)}</span>
              <span className="text-ink-muted48">{d.count}</span>
            </div>
            <div className="h-2 rounded-pill bg-canvas-parchment overflow-hidden">
              <div
                className={`h-full rounded-pill transition-all duration-300 ${STAGE_COLORS[d.status] || "bg-primary"}`}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {rejectedCount > 0 && (
        <p className="text-fine-print text-ink-muted48 pt-1 border-t border-hairline">
          {rejectedCount} rejected (shown separately — not part of the active pipeline)
        </p>
      )}
    </div>
  );
}
