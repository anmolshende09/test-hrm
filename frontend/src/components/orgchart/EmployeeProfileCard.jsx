import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { initials } from "../../utils/format";

export default function EmployeeProfileCard({ employee, hasChildren, collapsed, onToggle, childCount }) {
  const isActive = employee.status === "active";

  return (
    <div className="relative bg-canvas border border-hairline rounded-lg p-3.5 w-52 shrink-0">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {employee.profilePicture ? (
            <img
              src={employee.profilePicture}
              alt={employee.name}
              className="w-12 h-12 rounded-full object-cover border border-hairline"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong">
              {initials(employee.name)}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-canvas ${
              isActive ? "bg-success" : "bg-danger"
            }`}
            title={isActive ? "Active" : "Inactive"}
          />
        </div>
        <p className="text-caption-strong mt-2 truncate w-full">{employee.name}</p>
        <p className="text-fine-print text-ink-muted48 truncate w-full">{employee.designation}</p>
        {employee.department && (
          <p className="text-fine-print text-primary truncate w-full mt-0.5">{employee.department}</p>
        )}
      </div>

      {hasChildren && (
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand reports" : "Collapse reports"}
          className="press-active absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-canvas border border-hairline flex items-center justify-center text-ink-muted48 hover:text-primary shadow-sm"
        >
          {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      )}
      {hasChildren && collapsed && (
        <span className="absolute -bottom-3 left-[calc(50%+14px)] text-fine-print text-ink-muted48 bg-canvas-parchment rounded-pill px-1.5">
          +{childCount}
        </span>
      )}
    </div>
  );
}
