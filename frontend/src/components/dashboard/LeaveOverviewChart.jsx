import React from "react";
import EmptyState from "../common/EmptyState";
import { titleCase } from "../../utils/format";

const STATUS_CLASSES = {
  approved: "text-success",
  pending: "text-warning",
  rejected: "text-danger",
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function LeaveOverviewChart({ data = [], total = 0 }) {
  if (total === 0) {
    return <EmptyState title="No leave applications this month" description="Applications submitted this month will be summarized here." />;
  }

  let cumulativeOffset = 0;
  const segments = data.map((d) => {
    const fraction = d.count / total;
    const dashLength = fraction * CIRCUMFERENCE;
    const segment = { ...d, dashLength, offset: cumulativeOffset, percent: Math.round(fraction * 100) };
    cumulativeOffset += dashLength;
    return segment;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="14" className="text-canvas-parchment" />
          {segments.map((s) => (
            <circle
              key={s.status}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeDasharray={`${s.dashLength} ${CIRCUMFERENCE - s.dashLength}`}
              strokeDashoffset={-s.offset}
              className={STATUS_CLASSES[s.status] || "text-primary"}
            >
              <title>{`${titleCase(s.status)} : ${s.count}`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-display-sm">{total}</span>
          <span className="text-fine-print text-ink-muted48">total</span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {segments.map((s) => (
          <div key={s.status} className="flex items-center justify-between text-caption">
            <span className={`flex items-center gap-2 ${STATUS_CLASSES[s.status] || "text-primary"}`}>
              <span className="w-2.5 h-2.5 rounded-xs bg-current inline-block" />
              <span className="text-ink-muted80">{titleCase(s.status)}</span>
            </span>
            <span className="text-ink-muted48">
              {s.count} ({s.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
