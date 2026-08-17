import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, IdCard } from "lucide-react";
import { designationService } from "../services/designationService";
import { departmentService } from "../services/departmentService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";

const emptyForm = { name: "", department: "", status: "active" };
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Designations() {
  const toast = useToast();
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    designationService
      .list({
        search: debouncedSearch || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setDesignations(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load designations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, departmentFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (designation) => {
    setEditing(designation);
    setForm({
      name: designation.name,
      department: designation.department?._id || designation.department || "",
      status: designation.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name) next.name = "Designation name is required";
    if (!form.department) next.department = "Department is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      if (editing) {
        await designationService.update(editing._id, form);
        toast.success("Designation updated");
      } else {
        await designationService.create(form);
        toast.success("Designation created");
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await designationService.remove(deleteTarget._id);
      toast.success("Designation deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete designation");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Designation",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IdCard size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (row) => row.department?.name || "—" },
    { key: "branch", header: "Branch", render: (row) => row.department?.branch?.name || "All Branches" },
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
          <h1 className="text-display-md">Designations</h1>
          <p className="text-caption text-ink-muted48 mt-1">Job titles, assigned to departments.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Designation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search designations…" className="max-w-sm" />
        <SelectField
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
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
        <Table
          columns={columns}
          data={designations}
          loading={loading}
          emptyTitle="No designations found"
          emptyDescription="Try different filters, or add your first designation."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Designation" : "Add Designation"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Designation Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Senior Software Engineer" />
          <SelectField
            label="Department"
            required
            placeholder="Select department"
            value={form.department}
            error={errors.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
          />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create designation"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete designation?"
        description={`This will permanently remove "${deleteTarget?.name}". Designations with assigned employees can't be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
