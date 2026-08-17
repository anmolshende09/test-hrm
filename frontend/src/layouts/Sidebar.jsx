import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Network,
  Users,
  Building2,
  MapPin,
  IdCard,
  Award,
  FileCheck2,
  Clock,
  ShieldCheck,
  ClipboardEdit,
  Palmtree,
  CalendarCheck,
  FileText,
  Megaphone,
  Briefcase,
  ChevronRight,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MANAGER_ROLES } from "../constants/roles";

export const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    children: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/calendar",
        label: "Calendar",
        icon: CalendarDays,
      },
    ],
  },

  // Workforce Management
  {
    title: "Workforce Management",
    children: [
      {
        to: "/employees",
        label: "Employees",
        icon: Users,
        managerOnly: true,
      },
      {
        to: "/org-chart",
        label: "Organization Chart",
        icon: Network,
      },

      // Organization Structure
      {
        label: "Organization Structure",
        icon: Building2,
        children: [
          {
            to: "/branches",
            label: "Branches",
            icon: MapPin,
            managerOnly: true,
          },
          {
            to: "/departments",
            label: "Departments",
            icon: Building2,
            managerOnly: true,
          },
          {
            to: "/designations",
            label: "Designations",
            icon: IdCard,
            managerOnly: true,
          },
          {
            to: "/holidays",
            label: "Holidays",
            icon: Palmtree,
            managerOnly: true,
          },
          {
            to: "/announcements",
            label: "Announcements",
            icon: Megaphone,
          },
          {
            to: "/award-types",
            label: "Award Types",
            icon: Award,
            managerOnly: true,
          },
          {
            to: "/document-types",
            label: "Document Types",
            icon: FileCheck2,
            managerOnly: true,
          },
        ],
      },

      // Attendance
      {
        label: "Attendance",
        icon: CalendarCheck,
        children: [
          {
            to: "/attendance",
            label: "Attendance Records",
            icon: CalendarCheck,
          },
          {
            to: "/shifts",
            label: "Shifts",
            icon: Clock,
            managerOnly: true,
          },
          {
            to: "/attendance-policies",
            label: "Attendance Policies",
            icon: ShieldCheck,
            managerOnly: true,
          },
          {
            to: "/attendance-regularizations",
            label: "Attendance Regularizations",
            icon: ClipboardEdit,
          },
        ],
      },

      {
        to: "/leaves",
        label: "Leave Management",
        icon: FileText,
      },
    ],
  },

  // Talent & Growth
  {
    title: "Talent & Growth",
    children: [
      {
        label: "Recruitment",
        icon: Briefcase,
        managerOnly: true,
        children: [
          {
            to: "/candidates",
            label: "Candidates",
            icon: Users,
          },
          {
            to: "/interviews",
            label: "Interviews",
            icon: CalendarDays,
          },
          {
            to: "/offers",
            label: "Offers",
            icon: FileText,
          },
          {
            to: "/job-categories",
            label: "Job Categories",
            icon: Building2,
          },
          {
            to: "/job-types",
            label: "Job Types",
            icon: IdCard,
          },
        ],
      },

      {
        label: "Employee Lifecycle",
        icon: Users,
        managerOnly: true,
        children: [
          {
            to: "/promotions",
            label: "Promotions",
            icon: Users,
          },
          {
            to: "/warnings",
            label: "Warnings",
            icon: ShieldCheck,
          },
          {
            to: "/resignations",
            label: "Resignations",
            icon: ClipboardEdit,
          },
          {
            to: "/terminations",
            label: "Terminations",
            icon: FileCheck2,
          },
        ],
      },

      {
        label: "Training &Development",
        icon: Award,
        managerOnly: true,
        children: [
          {
            to: "/training-types",
            label: "Training Types",
            icon: Award,
          },
          {
            to: "/training-programs",
            label: "Training Programs",
            icon: GraduationCap,
          },
          {
            to: "/employee-trainings",
            label: "Employee Trainings",
            icon: FileText,
          },
          {
            to: "/training-dashboard",
            label: "Training Dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
    ],
  },

  // Finance & Assets
  {
    title: "Finance & Assets",
    children: [
      {
        label: "Payroll Management",
        icon: Briefcase,
        managerOnly: true,
        children: [
          {
            to: "/payslips",
            label: "Payslips",
            icon: FileText,
          },
          {
            to: "/payroll-runs",
            label: "Payroll Runs",
            icon: CalendarDays,
          },
          {
            to: "/employee-salaries",
            label: "Employee Salaries",
            icon: Users,
          },
          {
            to: "/salary-components",
            label: "Salary Components",
            icon: Award,
          },
        ],
      },

      {
        label: "Asset Management",
        icon: Building2,
        managerOnly: true,
        children: [
          {
            to: "/asset-dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            to: "/assets",
            label: "Assets",
            icon: Building2,
          },
          {
            to: "/depreciation",
            label: "Depreciation",
            icon: CalendarDays,
          },
          {
            to: "/asset-types",
            label: "Asset Types",
            icon: FileCheck2,
          },
        ],
      },
    ],
  },

  // Document
  {
    title: "Document",
    children: [
      {
        label: "Contracts",
        icon: FileText,
        managerOnly: true,
        children: [
          {
            to: "/documents",
            label: "HR Documents",
            icon: FileText,
          },
          {
            to: "/employee-contracts",
            label: "Employee Contracts",
            icon: ClipboardEdit,
          },
          {
            to: "/contract-templates",
            label: "Contract Templates",
            icon: FileCheck2,
          },
          {
            to: "/document-templates",
            label: "Document Templates",
            icon: FileCheck2,
          },
          {
            to: "/contract-types",
            label: "Contract Types",
            icon: IdCard,
          },
          {
            to: "/document-categories",
            label: "Document Categories",
            icon: Building2,
          },
        ],
      },

      {
        to: "/media-library",
        label: "Media Library",
        icon: FileCheck2,
        managerOnly: true,
      },
    ],
  },

  // System Control
  {
    title: "System Control",
    children: [
      {
        label: "System Users",
        icon: Users,
        managerOnly: true,
        children: [
          {
            to: "/users",
            label: "Users",
            icon: Users,
          },
          {
            to: "/roles",
            label: "Roles",
            icon: ShieldCheck,
          },
        ],
      },

      {
        to: "/currencies",
        label: "Currencies",
        icon: Briefcase,
        managerOnly: true,
      },

      {
        label: "Settings",
        icon: ClipboardEdit,
        managerOnly: true,
        children: [
          {
            to: "/settings/system",
            label: "System Settings",
            icon: Building2,
          },
          {
            to: "/settings/brand",
            label: "Brand Settings",
            icon: Award,
          },
          {
            to: "/settings/email",
            label: "Email Settings",
            icon: FileText,
          },
          {
            to: "/settings/working-days",
            label: "Working Days",
            icon: CalendarDays,
          },
          {
            to: "/settings/storage",
            label: "Storage Settings",
            icon: Building2,
          },
        ],
      },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-void text-white z-40 flex flex-col
          transition-transform duration-200 md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-lg border-b border-white/10">
          <span className="text-tagline text-white">HRMS</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {SIDEBAR_SECTIONS.map((section) => {
            /*
             * Filter the section's top-level items first.
             * This prevents empty section headings from appearing
             * for employees.
             */
            const visibleChildren = section.children.filter(
              (item) => !item.managerOnly || canManage
            );

            /*
             * If the employee has no accessible items in this section,
             * don't render the section at all.
             */
            if (visibleChildren.length === 0) {
              return null;
            }

            return (
              <div key={section.title}>
                <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {section.title}
                </h3>

                <div className="space-y-1">
                  {visibleChildren.map((item) => {
                    // Dropdown item
                    if (item.children) {
                      /*
                       * Filter dropdown children based on permissions.
                       */
                      const visibleDropdownChildren = item.children.filter(
                        (child) => !child.managerOnly || canManage
                      );

                      /*
                       * If a dropdown has no accessible children,
                       * don't show the dropdown itself.
                       */
                      if (visibleDropdownChildren.length === 0) {
                        return null;
                      }

                      const isOpen = expandedMenus[item.label];

                      return (
                        <div key={item.label}>
                          <button
                            type="button"
                            onClick={() => toggleMenu(item.label)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-[14px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={18} />
                              <span>{item.label}</span>
                            </div>

                            {isOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>

                          {isOpen && (
                            <div className="ml-7 mt-1 space-y-1">
                              {visibleDropdownChildren.map((child) => (
                                <NavLink
                                  key={child.to}
                                  to={child.to}
                                  onClick={onClose}
                                  className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                                      isActive
                                        ? "bg-primary text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`
                                  }
                                >
                                  <child.icon size={16} />
                                  {child.label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Normal link
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-[14px] transition-colors ${
                            isActive
                              ? "bg-primary text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        <item.icon size={18} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}