import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, ListChecks, Timer, TrendingUp } from "lucide-react";
import { attendancePolicyService } from "../services/attendancePolicyService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, TextAreaField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { titleCase } from "../utils/format";

const emptyForm = { name: "", type: "standard", lateArrivalGrace: 10, earlyDepartureGrace: 10, overtimeRate: 1.5, description: "", status: "active" };
const TYPE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "flexible", label: "Flexible" },
  { value: "strict", label: "Strict" },
];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AttendancePolicies() {
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    attendancePolicyService
      .list({ search: debouncedSearch || undefined, type: typeFilter || undefined, status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setPolicies(data.data);
        setStats(data.stats);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load attendance policies"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, typeFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (policy) => {
    setEditing(policy);
    setForm({
      name: policy.name,
      type: policy.type,
      lateArrivalGrace: policy.lateArrivalGrace,
      earlyDepartureGrace: policy.earlyDepartureGrace,
      overtimeRate: policy.overtimeRate,
      description: policy.description || "",
      status: policy.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Policy name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await attendancePolicyService.update(editing._id, form);
        toast.success("Policy updated");
      } else {
        await attendancePolicyService.create(form);
        toast.success("Policy created");
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
      await attendancePolicyService.remove(deleteTarget._id);
      toast.success("Policy deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete policy");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Policy",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-caption-strong">{row.name}</p>
            <p className="text-fine-print text-ink-muted48">{titleCase(row.type)}</p>
          </div>
        </div>
      ),
    },
    { key: "lateArrivalGrace", header: "Late Grace", render: (row) => `${row.lateArrivalGrace}m` },
    { key: "earlyDepartureGrace", header: "Early Grace", render: (row) => `${row.earlyDepartureGrace}m` },
    { key: "overtimeRate", header: "Overtime Rate", render: (row) => `${row.overtimeRate}x` },
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
          <h1 className="text-display-md">Attendance Policies</h1>
          <p className="text-caption text-ink-muted48 mt-1">Configure attendance rules for employees.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Policy
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Active Policy Count" count={stats.activePolicyCount} icon={ListChecks} theme="blue" />
          <StatCard title="Average Grace Time" count={`${stats.averageGraceTime}m`} icon={Timer} theme="amber" />
          <StatCard title="Average Overtime Rate" count={`${stats.averageOvertimeRate}x`} icon={TrendingUp} theme="green" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search policies…" className="max-w-sm" />
        <SelectField
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[{ value: "", label: "All Types" }, ...TYPE_OPTIONS]}
          className="w-full sm:w-40"
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
          data={policies}
          loading={loading}
          emptyTitle="No attendance policies yet"
          emptyDescription="Add a Standard, Flexible, or Strict policy to define grace periods and overtime rules."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Policy" : "Add Policy"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Policy Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Standard Office Policy" />
          <SelectField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPE_OPTIONS} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Late Arrival Grace (minutes)" type="number" min="0" value={form.lateArrivalGrace} onChange={(e) => setForm({ ...form, lateArrivalGrace: e.target.value })} />
            <TextField label="Early Departure Grace (minutes)" type="number" min="0" value={form.earlyDepartureGrace} onChange={(e) => setForm({ ...form, earlyDepartureGrace: e.target.value })} />
          </div>
          <TextField label="Overtime Rate (multiplier)" type="number" min="0" step="0.1" value={form.overtimeRate} onChange={(e) => setForm({ ...form, overtimeRate: e.target.value })} placeholder="e.g. 1.5" />
          <TextAreaField label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create policy"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete policy?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
