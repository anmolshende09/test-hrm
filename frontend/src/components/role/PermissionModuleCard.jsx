import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function PermissionModuleCard({ module, selectedKeys, onToggle, onToggleAll, expanded, onToggleExpand }) {
  const selectedCount = module.permissions.filter((p) => selectedKeys.has(p.key)).length;
  const allSelected = selectedCount === module.permissions.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-4 py-3 bg-canvas-parchment text-left"
      >
        <label className="flex items-center gap-2.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => el && (el.indeterminate = someSelected)}
            onChange={() => onToggleAll(module)}
            className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
          />
          <span className="text-caption-strong">{module.moduleLabel}</span>
        </label>
        <div className="flex items-center gap-3">
          <span className="text-fine-print text-ink-muted48">
            {selectedCount} of {module.permissions.length} selected
          </span>
          {expanded ? <ChevronDown size={16} className="text-ink-muted48" /> : <ChevronRight size={16} className="text-ink-muted48" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {module.permissions.map((perm) => (
            <label key={perm.key} className="flex items-center gap-2.5 text-caption cursor-pointer">
              <input
                type="checkbox"
                checked={selectedKeys.has(perm.key)}
                onChange={() => onToggle(perm.key)}
                className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
              />
              {perm.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
