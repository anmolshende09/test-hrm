import React from "react";
import { titleCase } from "../../utils/format";

const STYLES = {
  // Leave / general
  pending: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  // Attendance
  present: "bg-success-soft text-success",
  absent: "bg-danger-soft text-danger",
  half_day: "bg-warning-soft text-warning",
  on_leave: "bg-primary/10 text-primary",
  day_off: "bg-ink-muted48/10 text-ink-muted80",
  // Derived-only, matrix view
  holiday: "bg-success-soft text-success",
  future: "bg-canvas-parchment text-ink-muted48",
  not_added: "bg-canvas-parchment text-ink-muted48",
  // Employee status
  active: "bg-success-soft text-success",
  inactive: "bg-ink-muted48/10 text-ink-muted48",
  // Recruitment: Candidate pipeline
  applied: "bg-primary/10 text-primary",
  screening: "bg-warning-soft text-warning",
  interview: "bg-warning-soft text-warning",
  offer: "bg-success-soft text-success",
  hired: "bg-success-soft text-success",
  // Recruitment: Interview
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
  rescheduled: "bg-warning-soft text-warning",
  submitted: "bg-success-soft text-success",
  // Recruitment: Offer
  accepted: "bg-success-soft text-success",
  withdrawn: "bg-ink-muted48/10 text-ink-muted80",
};

/**
 * StatusBadge — implements the Dashboard/Leave modules' "Status Badge"
 * reusable component. Colors are semantic additions not present in the
 * source design system (see Known Gaps: no error/state colors were defined).
 */
export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-ink-muted48/10 text-ink-muted48";
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-caption-strong ${style}`}>
      {titleCase(status)}
    </span>
  );
}
