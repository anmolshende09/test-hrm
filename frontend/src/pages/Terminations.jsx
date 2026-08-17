import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserX } from "lucide-react";
import { terminationService } from "../services/terminationService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField, TextField } from "../components/common/FormField";
import { formatDate, titleCase, toInputDate } from "../utils/format";

const TYPE_OPTIONS = [
  { value: "performance", label: "Performance" },
  { value: "misconduct", label: "Misconduct" },
  { value: "layoff", label: "Layoff" },
  { value: "end_of_contract", label: "End of Contract" },
  { value: "other", label: "Other" },
];
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "finalized", label: "Finalized" },
];
const emptyForm = { employee: "", terminationType: "performance", terminationDate: "", noticeDate: "", status: "pending" };

export default function Terminations() {
  const toast = useToast();
  const [terminations, setTerminations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    terminationService
      .list({ status: statusFilter || undefined, terminationType: typeFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setTerminations(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load terminations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [statusFilter, typeFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      employee: t.employee?._id || "",
      terminationType: t.terminationType,
      terminationDate: toInputDate(t.terminationDate),
      noticeDate: toInputDate(t.noticeDate),
      status: t.status,
    });
    setErrors({});
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.employee) next.employee = "Employee is required";
    if (!form.terminationDate) next.terminationDate = "Termination date is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (!form.noticeDate) fd.delete("noticeDate");
      if (editing) {
        await terminationService.update(editing._id, fd);
        toast.success("Termination updated");
      } else {
        await terminationService.create(fd);
        toast.success("Termination recorded");
      }
      closeModal();
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
      await terminationService.remove(deleteTarget._id);
      toast.success("Termination deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "employee", header: "Employee", render: (r) => r.employee?.name || "—" },
    { key: "terminationType", header: "Type", render: (r) => titleCase(r.terminationType) },
    { key: "terminationDate", header: "Termination Date", render: (r) => formatDate(r.terminationDate) },
    { key: "noticeDate", header: "Notice Date", render: (r) => r.noticeDate ? formatDate(r.noticeDate) : "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions", header: "",
      render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>
          <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Terminations</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage employee termination records.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Record Termination</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-full sm:w-44" />
        <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: "", label: "All Types" }, ...TYPE_OPTIONS]} className="w-full sm:w-48" />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={terminations} loading={loading} emptyTitle="No terminations recorded" emptyDescription="Record employee terminations here." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Termination" : "Record Termination"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField label="Employee" required placeholder="Select employee" value={form.employee} error={errors.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} options={employees.map((e) => ({ value: e._id, label: e.name }))} disabled={!!editing} />
          <SelectField label="Termination Type" value={form.terminationType} onChange={(e) => setForm({ ...form, terminationType: e.target.value })} options={TYPE_OPTIONS} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Termination Date" type="date" required value={form.terminationDate} error={errors.terminationDate} onChange={(e) => setForm({ ...form, terminationDate: e.target.value })} />
            <TextField label="Notice Date (optional)" type="date" value={form.noticeDate} onChange={(e) => setForm({ ...form, noticeDate: e.target.value })} />
          </div>
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <p className="text-fine-print text-ink-muted48">Finalizing a termination will mark the employee as inactive.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Record termination"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete termination?" description="This will permanently remove this termination record." confirmLabel="Delete" />
    </div>
  );
}
