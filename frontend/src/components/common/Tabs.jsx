import React from "react";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-hairline">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2.5 text-caption-strong border-b-2 -mb-px transition-colors ${
            active === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-ink-muted48 hover:text-ink-muted80"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
