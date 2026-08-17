import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { roleService } from "../services/roleService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { TextField, TextAreaField } from "../components/common/FormField";
import PermissionModuleCard from "../components/role/PermissionModuleCard";

export default function AddRole() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [totalPermissions, setTotalPermissions] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCatalog = roleService.permissionCatalog().then(({ data }) => {
      setCatalog(data.data.modules);
      setTotalPermissions(data.data.totalPermissions);
    });
    const loadRole = isEditing ? roleService.get(id) : Promise.resolve(null);

    Promise.all([loadCatalog, loadRole])
      .then(([, roleRes]) => {
        if (roleRes) {
          const role = roleRes.data.data;
          setName(role.name);
          setDescription(role.description || "");
          setSelectedKeys(new Set(role.permissions || []));
        }
      })
      .catch(() => toast.error("Couldn't load role permissions"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSelected = selectedKeys.size;
  const allCatalogSelected = totalSelected === totalPermissions && totalPermissions > 0;

  const toggleExpand = (moduleKey) => setExpandedModules((prev) => ({ ...prev, [moduleKey]: !prev[moduleKey] }));

  const togglePermission = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModuleAll = (module) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const allSelected = module.permissions.every((p) => next.has(p.key));
      module.permissions.forEach((p) => {
        if (allSelected) next.delete(p.key);
        else next.add(p.key);
      });
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allCatalogSelected) {
      setSelectedKeys(new Set());
    } else {
      const all = new Set();
      catalog.forEach((mod) => mod.permissions.forEach((p) => all.add(p.key)));
      setSelectedKeys(all);
    }
  };

  const validate = () => {
    const next = {};
    if (!name) next.name = "Role name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name, description, permissions: Array.from(selectedKeys) };
      if (isEditing) {
        await roleService.update(id, payload);
        toast.success("Role updated");
      } else {
        await roleService.create(payload);
        toast.success("Role created");
      }
      navigate("/roles");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading permissions…" />;

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-fine-print text-ink-muted48 mb-1">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link> {" / "}
            <span>System Users</span> {" / "}
            <Link to="/roles" className="hover:underline">Roles</Link> {" / "}
            <span className="text-ink-muted80">{isEditing ? "Edit Role" : "Add Role"}</span>
          </p>
          <h1 className="text-display-md">{isEditing ? "Edit Role" : "Add Role"}</h1>
          <p className="text-caption text-ink-muted48 mt-1">Create a new role and assign permissions.</p>
        </div>
        <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate("/roles")}>
          Back
        </Button>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-4">
        <div>
          <h2 className="text-body-strong">Role Information</h2>
          <p className="text-caption text-ink-muted48 mt-0.5">Enter the role name and an optional description.</p>
        </div>
        <TextField label="Role Name" required value={name} error={errors.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HR Manager, Team Lead, Accountant" />
        <TextAreaField label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter role description..." />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-4">
        <div>
          <h2 className="text-body-strong">Role Permissions</h2>
          <p className="text-caption text-ink-muted48 mt-0.5">Select permissions for this role. You can select all permissions at once or manage them by module.</p>
          <p className="text-fine-print text-ink-muted48 mt-1">Note: Only permissions for modules available to your role are shown.</p>
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-sm bg-primary/5 border border-primary/20">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allCatalogSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            <span className="text-caption-strong">Select All Permissions</span>
          </label>
          <span className="text-caption text-ink-muted48">
            {totalSelected} of {totalPermissions} selected
          </span>
        </div>

        <div className="space-y-2">
          {catalog.map((module) => (
            <PermissionModuleCard
              key={module.moduleKey}
              module={module}
              selectedKeys={selectedKeys}
              onToggle={togglePermission}
              onToggleAll={toggleModuleAll}
              expanded={!!expandedModules[module.moduleKey]}
              onToggleExpand={() => toggleExpand(module.moduleKey)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate("/roles")} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>
    </div>
  );
}
