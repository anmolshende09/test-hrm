import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileCheck2 } from "lucide-react";
import { documentTypeService } from "../services/documentTypeService";
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

const emptyForm = { name: "", description: "", required: false, status: "active" };
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function DocumentTypes() {
  const toast = useToast();
  const [documentTypes, setDocumentTypes] = useState([]);
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
    documentTypeService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setDocumentTypes(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load document types"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (documentType) => {
    setEditing(documentType);
    setForm({
      name: documentType.name,
      description: documentType.description || "",
      required: !!documentType.required,
      status: documentType.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErrors({ name: "Document type name is required" });
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await documentTypeService.update(editing._id, form);
        toast.success("Document type updated");
      } else {
        await documentTypeService.create(form);
        toast.success("Document type created");
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
      await documentTypeService.remove(deleteTarget._id);
      toast.success("Document type deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete document type");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Document Type",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileCheck2 size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
    {
      key: "required",
      header: "Required",
      render: (row) => (
        <span className={`text-caption-strong ${row.required ? "text-danger" : "text-ink-muted48"}`}>
          {row.required ? "Required" : "Optional"}
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
          <h1 className="text-display-md">Document Types</h1>
          <p className="text-caption text-ink-muted48 mt-1">Define employee document categories.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Document Type
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search document types…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={documentTypes}
          loading={loading}
          emptyTitle="No document types yet"
          emptyDescription="Add your first document type to categorize employee documents."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Document Type" : "Add Document Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Document Type Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Government ID" />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            This document is required for every employee
          </label>
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create document type"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete document type?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
