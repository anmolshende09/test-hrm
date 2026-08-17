import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCheck, UserX, Wrench, Download } from "lucide-react";
import { assetService } from "../services/assetService";
import { assetTypeService } from "../services/assetTypeService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import { downloadBlob } from "../utils/download";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, TextAreaField, SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, titleCase, toInputDate } from "../utils/format";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" }, { value: "assigned", label: "Assigned" },
  { value: "under_maintenance", label: "Under Maintenance" }, { value: "retired", label: "Retired" },
];
const DEPRECIATION_OPTIONS = [{ value: "straight_line", label: "Straight-line" }, { value: "none", label: "None" }];
const emptyForm = { name: "", assetCode: "", secondaryCode: "", assetType: "", location: "", purchaseDate: "", purchaseCost: "", warrantyExpiry: "", depreciationMethod: "straight_line", usefulLifeYears: 3, salvageValue: 0, status: "available" };

export default function Assets() {
  const toast = useToast();
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ scheduledDate: "", description: "" });
  const [scheduling, setScheduling] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    assetTypeService.list({ limit: 100 }).then(({ data }) => setAssetTypes(data.data)).catch(() => {});
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    assetService.list({ search: debouncedSearch || undefined, status: statusFilter || undefined, assetType: typeFilter || undefined, page, limit: 10 })
      .then(({ data }) => { setAssets(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load assets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter, typeFilter]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name, assetCode: a.assetCode, secondaryCode: a.secondaryCode || "", assetType: a.assetType?._id || "",
      location: a.location || "", purchaseDate: toInputDate(a.purchaseDate), purchaseCost: a.purchaseCost || "",
      warrantyExpiry: toInputDate(a.warrantyExpiry), depreciationMethod: a.depreciationMethod || "straight_line",
      usefulLifeYears: a.usefulLifeYears ?? 3, salvageValue: a.salvageValue ?? 0, status: a.status,
    });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name) next.name = "Name is required";
    if (!form.assetCode) next.assetCode = "Asset code is required";
    if (!form.assetType) next.assetType = "Asset type is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      if (editing) { await assetService.update(editing._id, form); toast.success("Asset updated"); }
      else { await assetService.create(form); toast.success("Asset created"); }
      setModalOpen(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleAssign = async () => {
    if (!assignEmployee) return;
    setAssigning(true);
    try { await assetService.assign(assignTarget._id, { employeeId: assignEmployee }); toast.success("Asset assigned"); setAssignTarget(null); setAssignEmployee(""); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't assign"); }
    finally { setAssigning(false); }
  };

  const handleReturn = async (asset) => {
    try { await assetService.returnAsset(asset._id); toast.success("Asset returned"); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't return asset"); }
  };

  const handleMaintenance = async (e) => {
    e.preventDefault();
    if (!maintenanceForm.scheduledDate) return;
    setScheduling(true);
    try { await assetService.scheduleMaintenance(maintenanceTarget._id, maintenanceForm); toast.success("Maintenance scheduled"); setMaintenanceTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't schedule maintenance"); }
    finally { setScheduling(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await assetService.remove(deleteTarget._id); toast.success("Asset deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try { const { data } = await assetService.export(); downloadBlob(data, "assets.csv"); }
    catch { toast.error("Couldn't export"); }
    finally { setExporting(false); }
  };

  const statusColors = { available: "bg-success-soft text-success", assigned: "bg-primary/10 text-primary", under_maintenance: "bg-warning-soft text-warning", retired: "bg-ink-muted48/10 text-ink-muted48" };

  const columns = [
    { key: "name", header: "Asset", render: (r) => (
      <div><p className="text-caption-strong">{r.name}</p><p className="text-fine-print text-ink-muted48">{r.assetCode}</p></div>
    )},
    { key: "assetType", header: "Type", render: (r) => r.assetType?.name || "—" },
    { key: "status", header: "Status", render: (r) => <span className={`text-fine-print px-2 py-0.5 rounded-pill font-medium ${statusColors[r.status]}`}>{titleCase(r.status)}</span> },
    { key: "assignedTo", header: "Assigned To", render: (r) => r.assignedTo?.name || "—" },
    { key: "purchaseCost", header: "Cost", render: (r) => r.purchaseCost ? r.purchaseCost.toLocaleString() : "—" },
    { key: "currentValue", header: "Current Value", render: (r) => r.currentValue != null ? r.currentValue.toLocaleString() : "—" },
    { key: "location", header: "Location", render: (r) => r.location || "—" },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1 items-center">
        {r.status === "available" && <button onClick={() => { setAssignTarget(r); setAssignEmployee(""); }} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48" title="Assign"><UserCheck size={15} /></button>}
        {r.status === "assigned" && <button onClick={() => handleReturn(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48" title="Return"><UserX size={15} /></button>}
        <button onClick={() => { setMaintenanceTarget(r); setMaintenanceForm({ scheduledDate: "", description: "" }); }} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48" title="Schedule maintenance"><Wrench size={15} /></button>
        <button onClick={() => openEdit(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"><Pencil size={15} /></button>
        <button onClick={() => setDeleteTarget(r)} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Assets</h1><p className="text-caption text-ink-muted48 mt-1">Manage company assets, assignments, and maintenance.</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport} loading={exporting}>Export</Button>
          <Button icon={Plus} onClick={openAdd}>Add Asset</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assets…" className="max-w-sm" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]} className="w-44" />
        <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: "", label: "All Types" }, ...assetTypes.map((t) => ({ value: t._id, label: t.name }))]} className="w-44" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={assets} loading={loading} emptyTitle="No assets found" emptyDescription="Add your first company asset." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Asset" : "Add Asset"} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Asset Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Asset Code" required value={form.assetCode} error={errors.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} />
            <TextField label="Secondary Code (optional)" value={form.secondaryCode} onChange={(e) => setForm({ ...form, secondaryCode: e.target.value })} />
            <SelectField label="Asset Type" required placeholder="Select type" value={form.assetType} error={errors.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} options={assetTypes.map((t) => ({ value: t._id, label: t.name }))} />
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
            <TextField label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            <TextField label="Purchase Cost" type="number" min="0" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} />
            <TextField label="Warranty Expiry" type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
            <SelectField label="Depreciation Method" value={form.depreciationMethod} onChange={(e) => setForm({ ...form, depreciationMethod: e.target.value })} options={DEPRECIATION_OPTIONS} />
            {form.depreciationMethod === "straight_line" && <>
              <TextField label="Useful Life (years)" type="number" min="0" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} />
              <TextField label="Salvage Value" type="number" min="0" value={form.salvageValue} onChange={(e) => setForm({ ...form, salvageValue: e.target.value })} />
            </>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Add asset"}</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign "${assignTarget?.name}"`}>
        <div className="space-y-4">
          <SelectField label="Assign To" placeholder="Select employee" value={assignEmployee} onChange={(e) => setAssignEmployee(e.target.value)} options={employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId || ""})` }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAssignTarget(null)} disabled={assigning}>Cancel</Button>
            <Button onClick={handleAssign} loading={assigning} disabled={!assignEmployee}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal open={!!maintenanceTarget} onClose={() => setMaintenanceTarget(null)} title={`Schedule Maintenance — "${maintenanceTarget?.name}"`}>
        <form onSubmit={handleMaintenance} className="space-y-4">
          <TextField label="Scheduled Date" type="date" required value={maintenanceForm.scheduledDate} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })} />
          <TextAreaField label="Description" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setMaintenanceTarget(null)} disabled={scheduling}>Cancel</Button>
            <Button type="submit" loading={scheduling}>Schedule</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete asset?" description={`Permanently remove "${deleteTarget?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}
