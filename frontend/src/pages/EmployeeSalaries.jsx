import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { employeeSalaryService } from "../services/employeeSalaryService";
import { employeeService } from "../services/employeeService";
import { salaryComponentService } from "../services/salaryComponentService";
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

const STATUS_OPTIONS = [{ value: "active", label: "Active" }, { value: "locked", label: "Locked" }];

export default function EmployeeSalaries() {
  const toast = useToast();
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allComponents, setAllComponents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ employee: "", basicSalary: "", selectedComponents: [], status: "active" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
    salaryComponentService.all().then(({ data }) => setAllComponents(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    employeeSalaryService.list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => { setSalaries(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load employee salaries"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line

  const toggleComponent = (id) => {
    setForm((prev) => ({
      ...prev,
      selectedComponents: prev.selectedComponents.includes(id)
        ? prev.selectedComponents.filter((c) => c !== id)
        : [...prev.selectedComponents, id],
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ employee: "", basicSalary: "", selectedComponents: [], status: "active" });
    setErrors({}); setModalOpen(true);
  };
  const openEdit = (s) => {
    if (s.status === "locked") { toast.error("This salary record is locked"); return; }
    setEditing(s);
    setForm({ employee: s.employee?._id || "", basicSalary: s.basicSalary, selectedComponents: (s.components || []).map((c) => c.component?._id || c.component), status: s.status });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.employee) next.employee = "Employee is required";
    if (!form.basicSalary) next.basicSalary = "Basic salary is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    const payload = {
      employee: form.employee,
      basicSalary: parseFloat(form.basicSalary),
      components: form.selectedComponents.map((id) => ({ component: id, overrideAmount: null })),
      status: form.status,
    };
    try {
      if (editing) { await employeeSalaryService.update(editing._id, payload); toast.success("Salary updated"); }
      else { await employeeSalaryService.create(payload); toast.success("Salary created"); }
      setModalOpen(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await employeeSalaryService.remove(deleteTarget._id); toast.success("Salary record deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "employee", header: "Employee", render: (r) => <div><p className="text-caption-strong">{r.employee?.name}</p><p className="text-fine-print text-ink-muted48">{r.employee?.employeeId}</p></div> },
    { key: "basicSalary", header: "Basic Salary", render: (r) => r.basicSalary?.toLocaleString() },
    { key: "components", header: "Components", render: (r) => `${(r.components || []).length} applied` },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>
        {r.status !== "locked" && <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Employee Salaries</h1><p className="text-caption text-ink-muted48 mt-1">Assign salary structures to employees.</p></div>
        <Button icon={Plus} onClick={openAdd}>Assign Salary</Button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" className="max-w-sm" />
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={salaries} loading={loading} emptyTitle="No salary records yet" emptyDescription="Assign a salary structure to employees before running payroll." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Salary" : "Assign Salary"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField label="Employee" required placeholder="Select employee" value={form.employee} error={errors.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} options={employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId || ""})` }))} disabled={!!editing} />
          <TextField label="Basic Salary" type="number" min="0" required value={form.basicSalary} error={errors.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} />
          {allComponents.length > 0 && (
            <div>
              <label className="block text-caption-strong text-ink-muted80 mb-1.5">Salary Components</label>
              <div className="border border-hairline rounded-sm p-3 space-y-2 max-h-48 overflow-y-auto">
                {allComponents.map((c) => (
                  <label key={c._id} className="flex items-center justify-between text-caption cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={form.selectedComponents.includes(c._id)} onChange={() => toggleComponent(c._id)} className="w-4 h-4 rounded-xs" />
                      {c.name}
                    </span>
                    <span className={`text-fine-print ${c.type === "earning" ? "text-success" : "text-danger"}`}>
                      {c.calculationType === "percentage" ? `${c.amount}%` : c.amount.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Assign salary"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete salary record?" description={`Remove salary assignment for "${deleteTarget?.employee?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}
