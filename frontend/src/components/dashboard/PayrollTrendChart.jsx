import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

export default function PayrollTrendChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getPayrollTrend(year)
      .then(({ data }) => setPayload(data.data))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner label="Loading payroll trend…" />;
  if (!payload) return <EmptyState title="Couldn't load payroll trend" description="Try again in a moment." />;

  const { months, total, availableYears } = payload;
  const max = Math.max(1, ...months.map((m) => m.netPay));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption text-ink-muted48">{formatCurrency(total)} total this year</span>
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
        <EmptyState title="No completed payroll runs this year" description="Net pay from completed runs will chart here." />
      ) : (
        <div className="flex items-end justify-between gap-1.5 h-40">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full max-w-6 bg-primary rounded-t-sm transition-all duration-300"
                style={{ height: `${(m.netPay / max) * 100}%`, minHeight: m.netPay > 0 ? "4px" : "0" }}
                title={`${m.label} ${year}\nNet Pay: ${formatCurrency(m.netPay)}`}
              />
              <span className="text-fine-print text-ink-muted48">{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
