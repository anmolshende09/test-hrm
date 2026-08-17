import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";

export default function HiringTrendChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getHiringTrend(year)
      .then(({ data }) => setPayload(data.data))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner label="Loading hiring trend…" />;
  if (!payload) return <EmptyState title="Couldn't load hiring trend" description="Try again in a moment." />;

  const { months, total, availableYears } = payload;
  const max = Math.max(1, ...months.map((m) => m.applied));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption text-ink-muted48">{total} total applied this year</span>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-8 px-2.5 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {total === 0 ? (
        <EmptyState title="No candidates applied this year" description="Applications for this year will chart here." />
      ) : (
        <div className="flex items-end justify-between gap-1.5 h-40">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full max-w-6 bg-primary rounded-t-sm transition-all duration-300"
                style={{ height: `${(m.applied / max) * 100}%`, minHeight: m.applied > 0 ? "4px" : "0" }}
                title={`${m.label} ${year}\nApplied: ${m.applied}\nHired: ${m.hired}`}
              />
              <span className="text-fine-print text-ink-muted48">{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
