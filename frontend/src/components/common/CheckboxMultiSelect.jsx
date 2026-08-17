import React from "react";

export default function CheckboxMultiSelect({ label, items, selected, onChange, emptyMessage }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (items.length === 0) {
    return <p className="text-caption text-ink-muted48">{emptyMessage || "Nothing available yet."}</p>;
  }

  return (
    <div>
      {label && <label className="block text-caption-strong text-ink-muted80 mb-1.5">{label}</label>}
      <div className="border border-hairline rounded-sm p-3 space-y-2 max-h-40 overflow-y-auto">
        {items.map((item) => (
          <label key={item._id} className="flex items-center gap-2 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item._id)}
              onChange={() => toggle(item._id)}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            {item.name}
          </label>
        ))}
      </div>
    </div>
  );
}
