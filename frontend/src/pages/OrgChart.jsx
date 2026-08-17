import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import OrgChartNode from "../components/orgchart/OrgChartNode";

// Turns the flat { _id, manager, ... } list from the API into a tree.
// Employees with no manager (or a manager that no longer resolves) become
// root nodes — multiple roots are expected until managers are assigned via
// each employee's "Reports To" field.
function buildTree(flatList) {
  const byId = new Map(flatList.map((e) => [e._id, { ...e, children: [] }]));
  const roots = [];

  byId.forEach((node) => {
    if (node.manager && byId.has(node.manager)) {
      byId.get(node.manager).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function OrgChart() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService
      .orgChart()
      .then(({ data }) => setEmployees(data.data))
      .catch(() => toast.error("Couldn't load the organization chart"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roots = useMemo(() => buildTree(employees), [employees]);
  const activeCount = useMemo(() => employees.filter((e) => e.status === "active").length, [employees]);
  const inactiveCount = employees.length - activeCount;

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-display-md">Organization Chart</h1>
        <p className="text-caption text-ink-muted48 mt-1">Visual reporting hierarchy across the company.</p>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-ink-muted48" />
          <span className="text-caption-strong">{employees.length} Total Employees</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-caption text-ink-muted48">{activeCount} Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="text-caption text-ink-muted48">{inactiveCount} Inactive</span>
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg overflow-x-auto">
        {loading ? (
          <LoadingSpinner label="Loading organization chart…" />
        ) : employees.length === 0 ? (
          <EmptyState title="No employees yet" description="Add employees to see them appear in the org chart." />
        ) : (
          <div className="flex justify-center min-w-max px-4 py-2">
            {roots.length === 1 ? (
              <OrgChartNode node={roots[0]} />
            ) : (
              <div className="flex gap-8">
                {roots.map((root) => (
                  <OrgChartNode key={root._id} node={root} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && roots.length > 1 && employees.length > 0 && (
        <p className="text-fine-print text-ink-muted48">
          Showing {roots.length} separate top-level branches — assign a "Reports To" manager on each employee to
          connect them into a single hierarchy.
        </p>
      )}
    </div>
  );
}
