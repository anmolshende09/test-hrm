import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, CalendarCheck, FilePlus2 } from "lucide-react";

const ACTIONS = [
  { label: "Add Employee", icon: UserPlus, to: "/employees?action=add", managerOnly: true },
  { label: "Mark Attendance", icon: CalendarCheck, to: "/attendance" },
  { label: "Apply Leave", icon: FilePlus2, to: "/leaves?action=apply" },
];

export default function QuickActions({ canManage }) {
  const navigate = useNavigate();
  const actions = ACTIONS.filter((a) => !a.managerOnly || canManage);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.to)}
          className="press-active flex items-center gap-3 bg-canvas border border-hairline rounded-lg p-4 text-left hover:border-primary/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <action.icon size={18} />
          </div>
          <span className="text-caption-strong">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
