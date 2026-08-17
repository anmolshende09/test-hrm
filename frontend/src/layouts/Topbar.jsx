import React, { useState } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../constants/roles";
import { initials } from "../utils/format";
import Breadcrumbs from "../components/common/Breadcrumbs";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-hairline bg-canvas flex items-center justify-between px-lg sticky top-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="press-active md:hidden text-ink-muted80"
        >
          <Menu size={22} />
        </button>

        <Breadcrumbs />
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 press-active"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong">
            {initials(user?.name)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-caption-strong leading-tight">{user?.name}</p>
            <p className="text-fine-print text-ink-muted48 leading-tight">{ROLE_LABELS[user?.role]}</p>
          </div>
          <ChevronDown size={14} className="text-ink-muted48" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-44 bg-canvas border border-hairline rounded-md shadow-lg z-20 py-1.5">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-caption text-danger hover:bg-canvas-parchment"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
