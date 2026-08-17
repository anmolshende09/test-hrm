import React from "react";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";
import { titleCase } from "../../utils/format";

export default function RecentLeaveRequests({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No leave requests yet" description="Requests submitted by employees will appear here." />;
  }

  return (
    <ul className="divide-y divide-divider-soft">
      {items.map((leave) => (
        <li key={leave._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
          <div className="min-w-0">
            <p className="text-caption-strong truncate">{leave.employee?.name || "Unknown"}</p>
            <p className="text-fine-print text-ink-muted48">{titleCase(leave.leaveType)}</p>
          </div>
          <StatusBadge status={leave.status} />
        </li>
      ))}
    </ul>
  );
}
