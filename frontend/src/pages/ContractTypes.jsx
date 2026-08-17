import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, IdCard } from "lucide-react";
import { contractTypeService } from "../services/contractTypeService";
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
  defaultDurationMonths: "",
  probationPeriodMonths: "",
  noticePeriodDays: "",
  isRenewable: true,
  status: "active",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function ContractTypes() {
  const toast = useToast();
  const [contractTypes, setContractTypes] = useState([]);
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
    contractTypeService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setContractTypes(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load contract types"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (contractType) => {
    setEditing(contractType);
    setForm({
      name: contractType.name,
      description: contractType.description || "",
      defaultDurationMonths: contractType.defaultDurationMonths ?? "",
      probationPeriodMonths: contractType.probationPeriodMonths ?? "",
      noticePeriodDays: contractType.noticePeriodDays ?? "",
      isRenewable: contractType.isRenewable !== false,
      status: contractType.status || "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErrors({ name: "Contract type name is required" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        defaultDurationMonths: form.defaultDurationMonths === "" ? null : Number(form.defaultDurationMonths),
        probationPeriodMonths: form.probationPeriodMonths === "" ? null : Number(form.probationPeriodMonths),
        noticePeriodDays: form.noticePeriodDays === "" ? null : Number(form.noticePeriodDays),
      };
      if (editing) {
        await contractTypeService.update(editing._id, payload);
        toast.success("Contract type updated");
      } else {
        await contractTypeService.create(payload);
        toast.success("Contract type created");
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
      await contractTypeService.remove(deleteTarget._id);
      toast.success("Contract type deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete contract type");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Contract Type",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IdCard size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration / Probation",
      render: (row) => (
        <span className="text-caption text-ink-muted80">
          {row.defaultDurationMonths != null ? `${row.defaultDurationMonths}mo` : "—"}
          {" / "}
          {row.probationPeriodMonths != null ? `${row.probationPeriodMonths}mo` : "—"}
        </span>
      ),
    },
    {
      key: "noticePeriodDays",
      header: "Notice Period",
      render: (row) => (row.noticePeriodDays != null ? `${row.noticePeriodDays} days` : "—"),
    },
    {
      key: "isRenewable",
      header: "Renewable",
      render: (row) => (
        <span className={`text-caption-strong ${row.isRenewable ? "text-success" : "text-ink-muted48"}`}>
          {row.isRenewable ? "Yes" : "No"}
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
          <h1 className="text-display-md">Contract Types</h1>
          <p className="text-caption text-ink-muted48 mt-1">Define reusable employment contract categories.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Contract Type
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search contract types…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={contractTypes}
          loading={loading}
          emptyTitle="No contract types yet"
          emptyDescription="Add your first contract type, e.g. Permanent, Temporary, or Probation."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Contract Type" : "Add Contract Type"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Contract Type Name"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Permanent, Temporary, Probation"
          />
          <TextAreaField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Default Duration (months)"
              type="number"
              min="0"
              value={form.defaultDurationMonths}
              onChange={(e) => setForm({ ...form, defaultDurationMonths: e.target.value })}
            />
            <TextField
              label="Probation Period (months)"
              type="number"
              min="0"
              value={form.probationPeriodMonths}
              onChange={(e) => setForm({ ...form, probationPeriodMonths: e.target.value })}
            />
            <TextField
              label="Notice Period (days)"
              type="number"
              min="0"
              value={form.noticePeriodDays}
              onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRenewable}
              onChange={(e) => setForm({ ...form, isRenewable: e.target.checked })}
              className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            Contracts of this type can be renewed
          </label>

          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Create contract type"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete contract type?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}