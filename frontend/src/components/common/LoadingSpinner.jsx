import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading…", full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-ink-muted48 ${full ? "min-h-[60vh]" : "py-16"}`}>
      <Loader2 size={28} className="animate-spin text-primary" />
      <p className="text-caption">{label}</p>
    </div>
  );
}
