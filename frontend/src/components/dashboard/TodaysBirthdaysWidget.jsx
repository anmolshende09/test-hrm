import React from "react";
import EmptyState from "../common/EmptyState";
import { initials } from "../../utils/format";

export default function TodaysBirthdaysWidget({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No birthdays today" description="Add a date of birth on an employee's profile to see it here." />;
  }

  return (
    <ul className="divide-y divide-divider-soft max-h-72 overflow-y-auto">
      {items.map((emp) => (
        <li key={emp._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
            {initials(emp.name)}
          </div>
          <p className="text-caption-strong truncate">{emp.name}</p>
        </li>
      ))}
    </ul>
  );
}
