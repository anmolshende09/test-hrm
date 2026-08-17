import React from "react";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/format";

export default function RecentCandidatesWidget({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No candidates yet" description="New applicants will show up here." />;
  }

  return (
    <ul className="divide-y divide-divider-soft">
      {items.map((c) => (
        <li key={c._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-caption-strong truncate">{c.name}</p>
            <p className="text-fine-print text-ink-muted48 truncate">
              {c.job} • {formatDate(c.createdAt)}
            </p>
          </div>
          <StatusBadge status={c.status} />
        </li>
      ))}
    </ul>
  );
}
