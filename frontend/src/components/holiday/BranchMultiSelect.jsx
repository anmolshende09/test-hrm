import React from "react";

export default function BranchMultiSelect({ branches, selected, onChange }) {
  const toggle = (branchId) => {
    if (selected.includes(branchId)) {
      onChange(selected.filter((id) => id !== branchId));
    } else {
      onChange([...selected, branchId]);
    }
  };

  if (branches.length === 0) {
    return <p className="text-caption text-ink-muted48">No branches yet — this holiday will apply company-wide.</p>;
  }

  return (
    <div>
      <label className="block text-caption-strong text-ink-muted80 mb-1.5">
        Applies To <span className="text-fine-print text-ink-muted48 font-normal">(leave unchecked for all branches)</span>
      </label>
      <div className="border border-hairline rounded-sm p-3 space-y-2 max-h-40 overflow-y-auto">
        {branches.map((b) => (
          <label key={b._id} className="flex items-center gap-2 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(b._id)}
              onChange={() => toggle(b._id)}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            {b.name}
          </label>
        ))}
      </div>
    </div>
  );
}
