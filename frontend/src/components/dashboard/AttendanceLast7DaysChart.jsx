import React from "react";
import EmptyState from "../common/EmptyState";

export default function AttendanceLast7DaysChart({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.present + d.absent + d.onLeave, 0);
  const max = Math.max(1, ...data.map((d) => d.present + d.absent + d.onLeave));

  if (total === 0) {
    return <EmptyState title="No attendance recorded this week" description="Mark attendance to see the daily breakdown here." />;
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d) => {
          const dayTotal = d.present + d.absent + d.onLeave;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
              <div
                className="w-full max-w-9 rounded-t-sm overflow-hidden flex flex-col-reverse"
                style={{ height: `${(dayTotal / max) * 100}%`, minHeight: dayTotal > 0 ? "4px" : "0" }}
                title={`${d.label}\nPresent: ${d.present}\nOn Leave: ${d.onLeave}\nAbsent: ${d.absent}`}
              >
                {dayTotal > 0 && (
                  <>
                    <div className="bg-success" style={{ height: `${(d.present / dayTotal) * 100}%` }} />
                    <div className="bg-warning" style={{ height: `${(d.onLeave / dayTotal) * 100}%` }} />
                    <div className="bg-danger" style={{ height: `${(d.absent / dayTotal) * 100}%` }} />
                  </>
                )}
              </div>
              <span className="text-fine-print text-ink-muted48">{d.label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-hairline">
        <span className="flex items-center gap-1.5 text-fine-print text-ink-muted48">
          <span className="w-2.5 h-2.5 rounded-xs bg-success inline-block" /> Present
        </span>
        <span className="flex items-center gap-1.5 text-fine-print text-ink-muted48">
          <span className="w-2.5 h-2.5 rounded-xs bg-warning inline-block" /> On Leave
        </span>
        <span className="flex items-center gap-1.5 text-fine-print text-ink-muted48">
          <span className="w-2.5 h-2.5 rounded-xs bg-danger inline-block" /> Absent
        </span>
      </div>
    </div>
  );
}
