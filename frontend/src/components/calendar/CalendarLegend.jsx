import React from "react";
import { CALENDAR_CATEGORY_STYLES } from "../../constants/options";

export default function CalendarLegend() {
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {Object.entries(CALENDAR_CATEGORY_STYLES).map(([key, style]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <span className="text-caption text-ink-muted48">{style.label}s</span>
        </div>
      ))}
    </div>
  );
}
