import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { assetTypeService } from "../services/assetTypeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, TextAreaField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";

const emptyForm = { name: "", description: "" };

export default function AssetTypes() {
  const toast = useToast();
  const [assetTypes, setAssetTypes] = useState([]);
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
    assetTypeService.list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => { setAssetTypes(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load asset types"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, description: t.description || "" }); setErrors({}); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setErrors({ name: "Name is required" }); return; }
    setSubmitting(true);
    try {
      if (editing) { await assetTypeService.update(editing._id, form); toast.success("Asset type updated"); }
      else { await assetTypeService.create(form); toast.success("Asset type created"); }
      setModalOpen(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await assetTypeService.remove(deleteTarget._id); toast.success("Asset type deleted"); setDeleteTarget(null); load(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Couldn't delete"); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: "name", header: "Asset Type", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Tag size={16} /></div>
        <span className="text-caption-strong">{r.name}</span>
      </div>
    )},
    { key: "description", header: "Description", render: (r) => r.description || "—" },
    { key: "assetCount", header: "Assets", render: (r) => r.assetCount ?? 0 },
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
        <div><h1 className="text-display-md">Asset Types</h1><p className="text-caption text-ink-muted48 mt-1">Categorize company assets.</p></div>
        <Button icon={Plus} onClick={openAdd}>Add Asset Type</Button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search asset types…" className="max-w-sm" />
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={assetTypes} loading={loading} emptyTitle="No asset types yet" emptyDescription="Add types like Laptop, Phone, or Vehicle." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Asset Type" : "Add Asset Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laptop" />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save changes" : "Create type"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete asset type?" description={`Assets of type "${deleteTarget?.name}" must be reassigned first.`} confirmLabel="Delete" />
    </div>
  );
}
