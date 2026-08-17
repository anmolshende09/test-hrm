import React from "react";
import EmptyState from "../common/EmptyState";
import { initials, titleCase } from "../../utils/format";

export default function EmployeesOnLeave({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No one is on leave today" description="Approved leave, or attendance marked on_leave, for today will show up here." />;
  }

  return (
    <ul className="divide-y divide-divider-soft">
      {items.map((leave) => (
        <li key={leave._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
            {initials(leave.employee?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-caption-strong truncate">{leave.employee?.name || "Unknown"}</p>
            <p className="text-fine-print text-ink-muted48">{titleCase(leave.leaveType || "on_leave")}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
