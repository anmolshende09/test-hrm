import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Building2, Award, FileText, CalendarDays } from "lucide-react";

// Only the 5 settings pages that actually exist as routes in Sidebar.jsx
// are linked here. The spec's reference screenshots show 11 nav items
// (Currency, IP Restriction, ZKTeco, NOC, etc.) but none of those are
// wired up in this app yet — linking to them would just be dead links.
const SETTINGS_NAV = [
  { to: "/settings/system", label: "System Settings", icon: Building2 },
  { to: "/settings/brand", label: "Brand Settings", icon: Award },
  { to: "/settings/email", label: "Email Settings", icon: FileText },
  { to: "/settings/working-days", label: "Working Days", icon: CalendarDays },
  { to: "/settings/storage", label: "Storage Settings", icon: Building2 },
];

export default function SettingsLayout() {
  return (
    <div className="space-y-lg">
      <div>
        <p className="text-fine-print text-ink-muted48 mb-1">Dashboard / Settings</p>
        <h1 className="text-display-md">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-lg">
        <nav className="space-y-1">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-caption-strong transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-ink-muted80 hover:bg-canvas-parchment"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
