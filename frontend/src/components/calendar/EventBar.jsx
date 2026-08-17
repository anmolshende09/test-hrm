import React from "react";
import { CALENDAR_CATEGORY_STYLES } from "../../constants/options";

export default function EventBar({ event, onClick, dense = false }) {
  const style = CALENDAR_CATEGORY_STYLES[event.category] || CALENDAR_CATEGORY_STYLES.meeting;
  const clickable = event.category !== "leave" && !!onClick;

  return (
    <button
      type="button"
      onClick={clickable ? () => onClick(event) : undefined}
      title={event.title}
      className={`w-full text-left truncate rounded-xs px-1.5 py-0.5 text-fine-print font-medium ${style.bar}
        ${dense ? "" : "mb-0.5"} ${clickable ? "press-active cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {event.title}
    </button>
  );
}
