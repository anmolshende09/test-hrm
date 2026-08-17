import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-caption text-ink-muted48">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="press-active w-9 h-9 rounded-full border border-hairline flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-parchment"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="press-active w-9 h-9 rounded-full border border-hairline flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-parchment"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
