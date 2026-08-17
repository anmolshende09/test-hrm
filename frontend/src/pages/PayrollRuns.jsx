import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Download, Play } from "lucide-react";
import { payrollRunService } from "../services/payrollRunService";
import { useToast } from "../context/ToastContext";
import { downloadBlob } from "../utils/download";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, titleCase, toInputDate } from "../utils/format";

const FREQ_OPTIONS = [{ value: "monthly", label: "Monthly" }, { value: "bi_weekly", label: "Bi-weekly" }, { value: "weekly", label: "Weekly" }];
const STATUS_OPTIONS = [{ value: "draft", label: "Draft" }, { value: "processing", label: "Processing" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }];
const emptyForm = { title: "", frequency: "monthly", periodStart: "", periodEnd: "", payDate: "", status: "draft" };

export default function PayrollRuns() {
  const toast = useToast();
  const [runs, setRuns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    payrollRunService.list({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => { setRuns(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load payroll runs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (r) => {
    if (r.status === "completed") { toast.error("Completed payroll runs cannot be edited"); return; }
    setEditing(r);
    setForm({ title: r.title, frequency: r.frequency, periodStart: toInputDate(r.periodStart), periodEnd: toInputDate(r.periodEnd), payDate: toInputDate(r.payDate), status: r.status });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.periodStart) next.periodStart = "Period start is required";
    if (!form.periodEnd) next.periodEnd = "Period end is required";
    if (!form.payDate) next.payDate = "Pay date is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      if (editing) { await payrollRunService.update(editing._id, form); toast.success("Payroll run updated"); }
      else { await payrollRunService.create(form); toast.success("Payroll run created"); }
      setModalOpen(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleProcess = async (run) => {
    setProcessing(run._id);
    try {
      await payrollRunService.update(run._id, { ...run, status: "processing", periodStart: toInputDate(run.periodStart), periodEnd: toInputDate(run.periodEnd), payDate: toInputDate(run.payDate) });
      toast.success("Payroll processed — payslips generated");
      load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't process payroll"); }
    finally { setProcessing(null); }
  };

  const handleExport = async (run) => {
    setExporting(run._id);
    try {
      const { data } = await payrollRunService.export(run._id);
      downloadBlob(data, `payroll-${run.title.replace(/\s+/g, "-")}.csv`);
    } catch { toast.error("Couldn't export payroll"); }
    finally { setExporting(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await payrollRunService.remove(deleteTarget._id); toast.success("Payroll run deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "title", header: "Title", render: (r) => <p className="text-caption-strong">{r.title}</p> },
    { key: "frequency", header: "Frequency", render: (r) => titleCase(r.frequency) },
    { key: "period", header: "Period", render: (r) => `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}` },
    { key: "payDate", header: "Pay Date", render: (r) => formatDate(r.payDate) },
    { key: "totalEmployees", header: "Employees" },
    { key: "netPay", header: "Net Pay", render: (r) => r.netPay ? r.netPay.toLocaleString() : "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1 items-center">
        {r.status === "draft" && <Button size="sm" variant="secondary" icon={Play} onClick={() => handleProcess(r)} loading={processing === r._id}>Process</Button>}
        {r.status === "completed" && <button onClick={() => handleExport(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48" disabled={exporting === r._id}><Download size={15} /></button>}
        {r.status !== "completed" && <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>}
        <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Payroll Runs</h1><p className="text-caption text-ink-muted48 mt-1">Process payroll for a period — payslips are generated automatically.</p></div>
        <Button icon={Plus} onClick={openAdd}>Create Payroll Run</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search runs…" className="max-w-sm" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-full sm:w-44" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={runs} loading={loading} emptyTitle="No payroll runs yet" emptyDescription="Create a payroll run to generate payslips for your employees." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Payroll Run" : "Create Payroll Run"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. July 2026 Payroll" />
          <SelectField label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} options={FREQ_OPTIONS} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Period Start" type="date" required value={form.periodStart} error={errors.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
            <TextField label="Period End" type="date" required value={form.periodEnd} error={errors.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
          </div>
          <TextField label="Pay Date" type="date" required value={form.payDate} error={errors.payDate} onChange={(e) => setForm({ ...form, payDate: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Create run"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete payroll run?" description="This will also delete all generated payslips for this run." confirmLabel="Delete" />
    </div>
  );
}
