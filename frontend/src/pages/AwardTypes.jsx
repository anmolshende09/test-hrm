import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { awardTypeService } from "../services/awardTypeService";
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

const emptyForm = { name: "", description: "", status: "active" };
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AwardTypes() {
  const toast = useToast();
  const [awardTypes, setAwardTypes] = useState([]);
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
    awardTypeService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setAwardTypes(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load award types"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (awardType) => {
    setEditing(awardType);
    setForm({
      name: awardType.name,
      description: awardType.description || "",
      status: awardType.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErrors({ name: "Award type name is required" });
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await awardTypeService.update(editing._id, form);
        toast.success("Award type updated");
      } else {
        await awardTypeService.create(form);
        toast.success("Award type created");
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
      await awardTypeService.remove(deleteTarget._id);
      toast.success("Award type deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete award type");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Award Type",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-warning-soft text-warning flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
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
          <h1 className="text-display-md">Award Types</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage employee recognition categories.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Award Type
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search award types…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={awardTypes}
          loading={loading}
          emptyTitle="No award types yet"
          emptyDescription="Add your first award type to start recognizing employees."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Award Type" : "Add Award Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Award Type Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Employee of the Month" />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create award type"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete award type?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
