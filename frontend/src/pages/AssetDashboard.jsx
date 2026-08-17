import React, { useEffect, useState } from "react";
import { assetService } from "../services/assetService";
import { useToast } from "../context/ToastContext";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/format";
import { Package, CheckCircle2, UserCheck, Wrench, DollarSign, TrendingDown } from "lucide-react";

export default function AssetDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetService.dashboard()
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error("Couldn't load asset dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading asset dashboard…" />;
  if (!data) return null;

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-display-md">Asset Dashboard</h1>
        <p className="text-caption text-ink-muted48 mt-1">Overview of company assets, values, and upcoming events.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Assets" count={data.totalAssets} icon={Package} theme="blue" />
        <StatCard title="Available" count={data.available} icon={CheckCircle2} theme="green" />
        <StatCard title="Assigned" count={data.assigned} icon={UserCheck} theme="blue" />
        <StatCard title="Maintenance" count={data.underMaintenance} icon={Wrench} theme="amber" />
        <StatCard title="Purchase Value" count={data.totalPurchaseValue?.toLocaleString()} icon={DollarSign} theme="blue" />
        <StatCard title="Current Value" count={data.totalCurrentValue?.toLocaleString()} icon={TrendingDown} theme="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <h3 className="text-body-strong mb-3">Recent Assignments</h3>
          {data.recentAssignments.length === 0 ? (
            <p className="text-caption text-ink-muted48">No recent assignments.</p>
          ) : (
            <ul className="divide-y divide-divider-soft">
              {data.recentAssignments.map((a) => (
                <li key={a._id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-caption-strong">{a.name}</p>
                  <p className="text-fine-print text-ink-muted48">{a.assignedTo} · {formatDate(a.assignedDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <h3 className="text-body-strong mb-3">Upcoming Maintenance</h3>
          {data.upcomingMaintenance.length === 0 ? (
            <p className="text-caption text-ink-muted48">No maintenance scheduled.</p>
          ) : (
            <ul className="divide-y divide-divider-soft">
              {data.upcomingMaintenance.map((m, i) => (
                <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-caption-strong">{m.asset}</p>
                  <p className="text-fine-print text-ink-muted48">{formatDate(m.scheduledDate)}{m.description ? ` · ${m.description}` : ""}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expiring Warranties */}
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <h3 className="text-body-strong mb-3">Warranties Expiring Soon</h3>
          {data.expiringWarranties.length === 0 ? (
            <p className="text-caption text-ink-muted48">No warranties expiring in the next 30 days.</p>
          ) : (
            <ul className="divide-y divide-divider-soft">
              {data.expiringWarranties.map((a) => (
                <li key={a._id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-caption-strong">{a.name}</p>
                  <p className="text-fine-print text-danger">{formatDate(a.warrantyExpiry)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
