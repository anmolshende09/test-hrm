import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { hrDocumentService } from "../services/hrDocumentService";
import { documentCategoryService } from "../services/documentCategoryService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import { SelectField } from "../components/common/FormField";
import HRDocumentForm from "../components/hrDocument/HRDocumentForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const STATUS_STYLES = {
  draft: "bg-canvas-parchment text-ink-muted48",
  published: "bg-success-soft text-success",
  archived: "bg-canvas-parchment text-ink-muted48",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export default function HRDocuments() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    documentCategoryService.all().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    hrDocumentService
      .list({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setItems(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load documents"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const buildFormData = (form, file) => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (file) formData.append("file", file);
    return formData;
  };

  const handleSubmit = async (form, file) => {
    setSubmitting(true);
    try {
      const formData = buildFormData(form, file);
      if (editing) {
        await hrDocumentService.update(editing._id, formData);
        toast.success("Document updated");
      } else {
        await hrDocumentService.create(formData);
        toast.success("Document uploaded");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (item) => {
    setApprovingId(item._id);
    try {
      await hrDocumentService.approve(item._id);
      toast.success("Document approved and published");
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't approve document");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDownload = async (item) => {
    hrDocumentService.trackDownload(item._id).catch(() => {});
    const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");
    window.open(`${base}${item.filePath}`, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await hrDocumentService.remove(deleteTarget._id);
      toast.success("Document deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete document");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">HR Documents</h1>
          <p className="text-caption text-ink-muted48 mt-1">Centralized storage for company-wide documents.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={openAdd}>
            Upload Document
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents…" className="max-w-sm" />
        <SelectField
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
          className="w-full sm:w-48"
        />
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_FILTER_OPTIONS}
          className="w-full sm:w-40"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading documents…" />
      ) : items.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-lg">
          <EmptyState title="No documents found" description="Try different filters, or upload your first document." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-canvas border border-hairline rounded-lg p-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.category?.color || "#0066cc"}1a`, color: item.category?.color || "#0066cc" }}
                  >
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body-strong">{item.title}</p>
                      <span className={`text-fine-print px-2 py-0.5 rounded-pill ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                      <span className="text-fine-print px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted48">
                        {item.category?.name || "Uncategorized"}
                      </span>
                      {item.isExpired && (
                        <span className="text-fine-print px-2 py-0.5 rounded-pill bg-danger-soft text-danger flex items-center gap-1">
                          <AlertTriangle size={11} /> Expired
                        </span>
                      )}
                      {item.requiresAcknowledgment && (
                        <span className="text-fine-print px-2 py-0.5 rounded-pill bg-primary/10 text-primary">
                          Acknowledgment required
                        </span>
                      )}
                    </div>
                    <p className="text-fine-print text-ink-muted48 mt-1">
                      v{item.version} • {item.fileType} • {formatFileSize(item.fileSize)} • {item.downloadCount || 0} downloads
                      {item.effectiveDate && ` • Effective ${formatDate(item.effectiveDate)}`}
                      {item.expiryDate && ` • Expires ${formatDate(item.expiryDate)}`}
                    </p>
                    {item.description && <p className="text-caption text-ink-muted80 mt-2">{item.description}</p>}
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center gap-1 text-caption text-primary hover:underline mt-2"
                    >
                      <Download size={13} /> {item.fileName}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canManage && item.status === "draft" && (
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={approvingId === item._id}
                      aria-label={`Approve ${item.title}`}
                      className="press-active w-8 h-8 rounded-full hover:bg-success-soft flex items-center justify-center text-ink-muted48 hover:text-success"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  )}
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.title}`}
                        className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Document" : "Upload Document"} width="max-w-xl">
        <HRDocumentForm
          initialValues={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete document?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}