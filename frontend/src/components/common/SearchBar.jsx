import React from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar — implements component.search-input: pill radius, canvas bg,
 * 44px height, leading search icon.
 */
export default function SearchBar({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted48" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-pill border border-black/[0.08] bg-canvas pl-10 pr-9 text-body
          placeholder:text-ink-muted48 focus:outline-none focus:border-primary-focus transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted48 hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
