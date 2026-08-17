import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, Users } from "lucide-react";
import { shiftService } from "../services/shiftService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, TextAreaField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";

const emptyForm = { name: "", startTime: "09:00", endTime: "17:00", breakDuration: 60, gracePeriod: 10, description: "", status: "active" };
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Shifts() {
  const toast = useToast();
  const [shifts, setShifts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    shiftService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setShifts(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load shifts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (shift) => {
    setEditing(shift);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      gracePeriod: shift.gracePeriod,
      description: shift.description || "",
      status: shift.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Shift name is required";
    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await shiftService.update(editing._id, form);
        toast.success("Shift updated");
      } else {
        await shiftService.create(form);
        toast.success("Shift created");
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
      await shiftService.remove(deleteTarget._id);
      toast.success("Shift deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete shift");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Shift",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "hours", header: "Shift Hours", render: (row) => `${row.startTime} – ${row.endTime}` },
    { key: "workingHoursLabel", header: "Working Hours" },
    { key: "breakDuration", header: "Break", render: (row) => `${row.breakDuration}m` },
    { key: "gracePeriod", header: "Grace Period", render: (row) => `${row.gracePeriod}m` },
    {
      key: "employeeCount",
      header: "Assigned",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-caption text-ink-muted80">
          <Users size={13} /> {row.employeeCount}
        </span>
      ),
    },
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
          <h1 className="text-display-md">Shifts</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage company work shifts.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Shift
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search shifts…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={shifts}
          loading={loading}
          emptyTitle="No shifts yet"
          emptyDescription="Add Morning, Evening, or Night shifts to start assigning employees."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Shift" : "Add Shift"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Shift Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Shift" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Start Time" type="time" required value={form.startTime} error={errors.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <TextField label="End Time" type="time" required value={form.endTime} error={errors.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <p className="text-fine-print text-ink-muted48 -mt-2">
            If the end time is earlier than the start time, the shift is treated as crossing midnight (e.g. a Night Shift).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Break Duration (minutes)" type="number" min="0" value={form.breakDuration} onChange={(e) => setForm({ ...form, breakDuration: e.target.value })} />
            <TextField label="Grace Period (minutes)" type="number" min="0" value={form.gracePeriod} onChange={(e) => setForm({ ...form, gracePeriod: e.target.value })} />
          </div>
          <TextAreaField label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create shift"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete shift?"
        description={`This will permanently remove "${deleteTarget?.name}". Shifts with assigned employees can't be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
