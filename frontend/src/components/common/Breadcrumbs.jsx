import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SIDEBAR_SECTIONS } from "../../layouts/Sidebar";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  const findBreadcrumbs = (items, currentPath, parents = []) => {
    if (!Array.isArray(items)) {
      return null;
    }

    for (const item of items) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const currentLabel = item.label || item.title;

      // Current page
      if (item.to && item.to === currentPath) {
        return currentLabel
          ? [
              ...parents,
              {
                label: currentLabel,
                to: item.to,
              },
            ]
          : parents;
      }

      // Nested children
      if (Array.isArray(item.children)) {
        const result = findBreadcrumbs(
          item.children,
          currentPath,
          currentLabel
            ? [
                ...parents,
                {
                  label: currentLabel,
                  to: item.to || null,
                },
              ]
            : parents
        );

        if (result) {
          return result;
        }
      }

      // Some sidebar structures may use items
      if (Array.isArray(item.items)) {
        const result = findBreadcrumbs(
          item.items,
          currentPath,
          currentLabel
            ? [
                ...parents,
                {
                  label: currentLabel,
                  to: item.to || null,
                },
              ]
            : parents
        );

        if (result) {
          return result;
        }
      }

      // Some sidebar structures may use subItems
      if (Array.isArray(item.subItems)) {
        const result = findBreadcrumbs(
          item.subItems,
          currentPath,
          currentLabel
            ? [
                ...parents,
                {
                  label: currentLabel,
                  to: item.to || null,
                },
              ]
            : parents
        );

        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  // Dashboard
  if (pathname === "/dashboard") {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 min-w-0 text-caption"
      >
        <span className="text-caption-strong text-ink truncate">
          Dashboard
        </span>
      </nav>
    );
  }

  let breadcrumbs = findBreadcrumbs(
    SIDEBAR_SECTIONS,
    pathname
  );

  // Special Role routes
  if (pathname === "/roles/new") {
    breadcrumbs = [
      {
        label: "System Users",
        to: null,
      },
      {
        label: "Roles",
        to: "/roles",
      },
      {
        label: "Add Role",
        to: null,
      },
    ];
  }

  if (
    pathname.startsWith("/roles/") &&
    pathname.endsWith("/edit")
  ) {
    breadcrumbs = [
      {
        label: "System Users",
        to: null,
      },
      {
        label: "Roles",
        to: "/roles",
      },
      {
        label: "Edit Role",
        to: null,
      },
    ];
  }

  // Fallback
  if (!breadcrumbs || breadcrumbs.length === 0) {
    const currentName = pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ");

    const formattedName = currentName
      ? currentName.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
      : "Page";

    breadcrumbs = [
      {
        label: formattedName,
        to: null,
      },
    ];
  }

  const fullBreadcrumbs = [
    {
      label: "Dashboard",
      to: "/dashboard",
    },
    ...breadcrumbs,
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 min-w-0 max-w-full overflow-hidden text-caption"
    >
      {fullBreadcrumbs.map((item, index) => {
        const isLast =
          index === fullBreadcrumbs.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight
                size={13}
                strokeWidth={1.8}
                className="text-ink-muted48 shrink-0"
              />
            )}

            {isLast || !item.to ? (
             <span
               className={
                 isLast
                   ? "text-caption-strong text-ink truncate min-w-0"
                   : "text-ink-muted48 truncate min-w-0"
               }
             >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-ink-muted48 hover:text-ink transition-colors truncate min-w-0"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}