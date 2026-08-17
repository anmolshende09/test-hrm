import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { departmentService } from "../services/departmentService";
import { branchService } from "../services/branchService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, TextAreaField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";

const emptyForm = { name: "", description: "", branch: "", status: "active" };
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Departments() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    departmentService
      .list({
        search: debouncedSearch || undefined,
        branch: branchFilter || undefined,
        status: statusFilter || undefined,
        limit: 50,
      })
      .then(({ data }) => setDepartments(data.data))
      .catch(() => toast.error("Couldn't load departments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debouncedSearch, branchFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description || "",
      branch: dept.branch?._id || dept.branch || "",
      status: dept.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErrors({ name: "Department name is required" });
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await departmentService.update(editing._id, form);
        toast.success("Department updated");
      } else {
        await departmentService.create(form);
        toast.success("Department created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentService.remove(deleteTarget._id);
      toast.success("Department deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete department");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Department",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "branch", header: "Branch", render: (row) => row.branch?.name || "—" },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
    { key: "employeeCount", header: "Employees" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Departments</h1>
          <p className="text-caption text-ink-muted48 mt-1">Organize your company's structure.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Department
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search departments…" className="max-w-sm" />
        <SelectField
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          options={[{ value: "", label: "All Branches" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
          className="w-full sm:w-48"
        />
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]}
          className="w-full sm:w-40"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={departments} loading={loading} emptyTitle="No departments found" emptyDescription="Try different filters, or create your first department." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Department Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <SelectField
            label="Branch (optional)"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            options={[{ value: "", label: "No branch" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
          />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create department"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete department?"
        description={`This will permanently remove "${deleteTarget?.name}". Departments with assigned employees can't be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
