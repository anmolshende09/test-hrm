import React from "react";

export default function Toggle({ checked, onChange, disabled, label, description }) {
  return (
    <label className={`flex items-center justify-between gap-4 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      {(label || description) && (
        <span>
          {label && <span className="text-caption-strong block">{label}</span>}
          {description && <span className="text-fine-print text-ink-muted48">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-pill transition-colors focus:outline-none focus:ring-2 focus:ring-primary-focus ${
          checked ? "bg-primary" : "bg-canvas-parchment border border-hairline"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
