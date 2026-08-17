import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

/**
 * EmptyState — the design system didn't define empty/error states (see
 * "Known Gaps"). This treats emptiness as direction, not mood, per the
 * frontend-design writing guidance: explain what's missing and what to do.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-canvas-parchment flex items-center justify-center text-ink-muted48 mb-4">
        <Icon size={22} />
      </div>
      <p className="text-body-strong">{title}</p>
      {description && <p className="text-caption text-ink-muted48 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
