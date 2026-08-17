import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Folder } from "lucide-react";
import { documentCategoryService } from "../services/documentCategoryService";
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

const emptyForm = {
  name: "",
  description: "",
  color: "#0066cc",
  icon: "folder",
  sortOrder: "0",
  isMandatory: false,
  status: "active",
};

const ICON_OPTIONS = [
  { value: "folder", label: "Folder" },
  { value: "file-text", label: "File" },
  { value: "file-check", label: "Verified File" },
  { value: "id-card", label: "ID Card" },
  { value: "shield-check", label: "Shield" },
  { value: "briefcase", label: "Briefcase" },
  { value: "clipboard", label: "Clipboard" },
  { value: "building", label: "Building" },
  { value: "award", label: "Award" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function DocumentCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
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
    documentCategoryService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setCategories(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load document categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "#0066cc",
      icon: category.icon || "folder",
      sortOrder: String(category.sortOrder ?? 0),
      isMandatory: !!category.isMandatory,
      status: category.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErrors({ name: "Category name is required" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, sortOrder: form.sortOrder === "" ? 0 : Number(form.sortOrder) };
      if (editing) {
        await documentCategoryService.update(editing._id, payload);
        toast.success("Document category updated");
      } else {
        await documentCategoryService.create(payload);
        toast.success("Document category created");
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
      await documentCategoryService.remove(deleteTarget._id);
      toast.success("Document category deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete document category");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Category",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${row.color || "#0066cc"}1a`, color: row.color || "#0066cc" }}
          >
            <Folder size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
    { key: "sortOrder", header: "Sort", render: (row) => row.sortOrder ?? 0 },
    {
      key: "isMandatory",
      header: "Mandatory",
      render: (row) => (
        <span className={`text-caption-strong ${row.isMandatory ? "text-danger" : "text-ink-muted48"}`}>
          {row.isMandatory ? "Required" : "Optional"}
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
          <h1 className="text-display-md">Document Categories</h1>
          <p className="text-caption text-ink-muted48 mt-1">Organize HR documents into structured classifications.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search document categories…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={categories}
          loading={loading}
          emptyTitle="No document categories yet"
          emptyDescription="Add your first category to start organizing HR documents."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Document Category" : "Add Document Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Category Name"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Legal, Compliance, Identification"
          />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-caption-strong text-ink-muted80 mb-1.5">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-10 rounded-sm border border-hairline cursor-pointer"
              />
            </div>
            <SelectField label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} options={ICON_OPTIONS} />
            <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMandatory}
              onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            Documents in this category are required for all employees
          </label>

          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete document category?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}