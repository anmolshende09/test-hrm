import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { promotionService } from "../services/promotionService";
import { employeeService } from "../services/employeeService";
import { designationService } from "../services/designationService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField, TextField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const emptyForm = { employee: "", newDesignation: "", effectiveDate: "", status: "pending" };

export default function Promotions() {
  const toast = useToast();
  const [promotions, setPromotions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
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
    designationService.all().then(({ data }) => setDesignations(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    promotionService.list({ status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => { setPromotions(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load promotions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [statusFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ employee: p.employee?._id || "", newDesignation: p.newDesignation?._id || "", effectiveDate: p.effectiveDate?.split("T")[0] || "", status: p.status });
    setErrors({}); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.employee) next.employee = "Employee is required";
    if (!form.newDesignation) next.newDesignation = "New designation is required";
    if (!form.effectiveDate) next.effectiveDate = "Effective date is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (editing) { await promotionService.update(editing._id, fd); toast.success("Promotion updated"); }
      else { await promotionService.create(fd); toast.success("Promotion created"); }
      closeModal(); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await promotionService.remove(deleteTarget._id); toast.success("Promotion deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "employee", header: "Employee", render: (r) => r.employee?.name || "—" },
    { key: "prev", header: "Previous Designation", render: (r) => r.previousDesignation?.name || "—" },
    { key: "new", header: "New Designation", render: (r) => r.newDesignation?.name || "—" },
    { key: "effectiveDate", header: "Effective Date", render: (r) => formatDate(r.effectiveDate) },
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
        <div><h1 className="text-display-md">Promotions</h1><p className="text-caption text-ink-muted48 mt-1">Track employee promotions and designation changes.</p></div>
        <Button icon={Plus} onClick={openAdd}>Add Promotion</Button>
      </div>
      <div className="flex gap-3">
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-full sm:w-44" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={promotions} loading={loading} emptyTitle="No promotions yet" />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Promotion" : "Add Promotion"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField label="Employee" required placeholder="Select employee" value={form.employee} error={errors.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} options={employees.map((e) => ({ value: e._id, label: e.name }))} disabled={!!editing} />
          <SelectField label="New Designation" required placeholder="Select designation" value={form.newDesignation} error={errors.newDesignation} onChange={(e) => setForm({ ...form, newDesignation: e.target.value })} options={designations.map((d) => ({ value: d._id, label: d.name }))} />
          <TextField label="Effective Date" type="date" required value={form.effectiveDate} error={errors.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Create promotion"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete promotion?" description={`Remove this promotion record for "${deleteTarget?.employee?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}
