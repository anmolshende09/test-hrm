import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { salaryComponentService } from "../services/salaryComponentService";
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
import { titleCase } from "../utils/format";

const TYPE_OPTIONS = [{ value: "earning", label: "Earning" }, { value: "deduction", label: "Deduction" }];
const CALC_OPTIONS = [{ value: "fixed", label: "Fixed Amount" }, { value: "percentage", label: "Percentage of Basic" }];
const STATUS_OPTIONS = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "locked", label: "Locked" }];
const emptyForm = { name: "", description: "", type: "earning", calculationType: "fixed", amount: "", status: "active" };

export default function SalaryComponents() {
  const toast = useToast();
  const [components, setComponents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [typeFilter, setTypeFilter] = useState("");
  const [calcFilter, setCalcFilter] = useState("");
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
    salaryComponentService.list({ search: debouncedSearch || undefined, type: typeFilter || undefined, calculationType: calcFilter || undefined, status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => { setComponents(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load salary components"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, typeFilter, calcFilter, statusFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (c) => {
    if (c.status === "locked") { toast.error("This component is locked and cannot be edited"); return; }
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", type: c.type, calculationType: c.calculationType, amount: c.amount, status: c.status });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name) next.name = "Name is required";
    if (!form.amount) next.amount = "Amount is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      if (editing) { await salaryComponentService.update(editing._id, form); toast.success("Component updated"); }
      else { await salaryComponentService.create(form); toast.success("Component created"); }
      setModalOpen(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await salaryComponentService.remove(deleteTarget._id); toast.success("Component deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "name", header: "Component", render: (r) => <span className="text-caption-strong">{r.name}</span> },
    { key: "description", header: "Description", render: (r) => r.description || "—" },
    { key: "type", header: "Type", render: (r) => <span className={`text-caption-strong ${r.type === "earning" ? "text-success" : "text-danger"}`}>{titleCase(r.type)}</span> },
    { key: "calc", header: "Calculation", render: (r) => `${r.calculationType === "percentage" ? `${r.amount}%` : r.amount.toLocaleString()} (${titleCase(r.calculationType)})` },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1">
        {r.status !== "locked" && <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>}
        {r.status === "locked" && <Lock size={15} className="text-ink-muted48 mx-2" />}
        {r.status !== "locked" && <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Salary Components</h1><p className="text-caption text-ink-muted48 mt-1">Define earnings and deductions applied to employee salaries.</p></div>
        <Button icon={Plus} onClick={openAdd}>Add Component</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search components…" className="max-w-sm" />
        <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: "", label: "All Types" }, ...TYPE_OPTIONS]} className="w-40" />
        <SelectField value={calcFilter} onChange={(e) => setCalcFilter(e.target.value)} options={[{ value: "", label: "All Calculations" }, ...CALC_OPTIONS]} className="w-48" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-40" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={components} loading={loading} emptyTitle="No salary components yet" emptyDescription="Add earnings (HRA, Transport) and deductions (Tax, PF) to build salary structures." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Salary Component" : "Add Salary Component"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Component Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. House Rent Allowance" />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPE_OPTIONS} />
            <SelectField label="Calculation Type" value={form.calculationType} onChange={(e) => setForm({ ...form, calculationType: e.target.value })} options={CALC_OPTIONS} />
          </div>
          <TextField label={form.calculationType === "percentage" ? "Percentage of Basic (%)" : "Fixed Amount"} type="number" min="0" step="0.01" required value={form.amount} error={errors.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Create component"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete salary component?" description={`Remove "${deleteTarget?.name}" permanently?`} confirmLabel="Delete" />
    </div>
  );
}
