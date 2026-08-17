import React from "react";

const THEMES = {
  blue: "bg-primary/10 text-primary",
  green: "bg-success-soft text-success",
  red: "bg-danger-soft text-danger",
  amber: "bg-warning-soft text-warning",
};

/**
 * StatCard — implements the Dashboard Module's "Statistics Cards" spec:
 * Title, Count, Icon, Color Theme.
 */
export default function StatCard({ title, count, icon: Icon, theme = "blue" }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg flex items-start justify-between">
      <div>
        <p className="text-caption text-ink-muted48">{title}</p>
        <p className="text-display-md mt-1">{count}</p>
      </div>
      <div className={`w-11 h-11 rounded-md flex items-center justify-center ${THEMES[theme]}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}
