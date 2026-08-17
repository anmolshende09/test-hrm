import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { resignationService } from "../services/resignationService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField, TextField } from "../components/common/FormField";
import { formatDate, toInputDate } from "../utils/format";

const STATUS_OPTIONS = [{ value: "pending", label: "Pending" }, { value: "accepted", label: "Accepted" }, { value: "withdrawn", label: "Withdrawn" }];
const emptyForm = { employee: "", resignationDate: toInputDate(new Date()), lastWorkingDay: "", status: "pending" };

export default function Resignations() {
  const toast = useToast();
  const [resignations, setResignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
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
    resignationService.list({ status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => { setResignations(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load resignations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [statusFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ employee: r.employee?._id || "", resignationDate: toInputDate(r.resignationDate), lastWorkingDay: toInputDate(r.lastWorkingDay), status: r.status });
    setErrors({}); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.employee) next.employee = "Employee is required";
    if (!form.lastWorkingDay) next.lastWorkingDay = "Last working day is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (editing) { await resignationService.update(editing._id, fd); toast.success("Resignation updated"); }
      else { await resignationService.create(fd); toast.success("Resignation recorded"); }
      closeModal(); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await resignationService.remove(deleteTarget._id); toast.success("Resignation deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "employee", header: "Employee", render: (r) => r.employee?.name || "—" },
    { key: "resignationDate", header: "Resignation Date", render: (r) => formatDate(r.resignationDate) },
    { key: "lastWorkingDay", header: "Last Working Day", render: (r) => formatDate(r.lastWorkingDay) },
    { key: "noticePeriod", header: "Notice Period", render: (r) => `${r.noticePeriodDays} days` },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>
        <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Resignations</h1><p className="text-caption text-ink-muted48 mt-1">Manage employee resignations and notice periods.</p></div>
        <Button icon={Plus} onClick={openAdd}>Record Resignation</Button>
      </div>
      <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-full sm:w-44" />
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={resignations} loading={loading} emptyTitle="No resignations recorded" />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Resignation" : "Record Resignation"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField label="Employee" required placeholder="Select employee" value={form.employee} error={errors.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} options={employees.map((e) => ({ value: e._id, label: e.name }))} disabled={!!editing} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Resignation Date" type="date" value={form.resignationDate} onChange={(e) => setForm({ ...form, resignationDate: e.target.value })} />
            <TextField label="Last Working Day" type="date" required value={form.lastWorkingDay} error={errors.lastWorkingDay} onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })} />
          </div>
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <p className="text-fine-print text-ink-muted48">Accepting a resignation will mark the employee as inactive.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Record resignation"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete resignation?" description="This will permanently remove this resignation record." confirmLabel="Delete" />
    </div>
  );
}
