import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, Star, Paperclip } from "lucide-react";
import { announcementService } from "../services/announcementService";
import { branchService } from "../services/branchService";
import { departmentService } from "../services/departmentService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES } from "../constants/options";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import { SelectField } from "../components/common/FormField";
import AnnouncementForm from "../components/announcement/AnnouncementForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, titleCase } from "../utils/format";

const PRIORITY_STYLES = {
  low: "bg-canvas-parchment text-ink-muted48",
  medium: "bg-primary/10 text-primary",
  high: "bg-danger-soft text-danger",
};

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!canManage) return;
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, [canManage]);

  const load = (page = 1) => {
    setLoading(true);
    announcementService
      .list({
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setItems(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load announcements"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, categoryFilter, priorityFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const buildFormData = (form, attachment) => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    });
    if (attachment) formData.append("attachment", attachment);
    return formData;
  };

  const handleSubmit = async (form, attachment) => {
    setSubmitting(true);
    try {
      const formData = buildFormData(form, attachment);
      if (editing) {
        await announcementService.update(editing._id, formData);
        toast.success("Announcement updated");
      } else {
        await announcementService.create(formData);
        toast.success("Announcement posted");
      }
      closeModal();
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
      await announcementService.remove(deleteTarget._id);
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete announcement");
    } finally {
      setDeleting(false);
    }
  };

  const audienceLabel = (item) => {
    if (item.audienceType === "company_wide") return "Company-wide";
    if (item.audienceType === "branch") return item.audienceBranches?.map((b) => b.name).join(", ") || "Branches";
    if (item.audienceType === "department") return item.audienceDepartments?.map((d) => d.name).join(", ") || "Departments";
    return "—";
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Announcements</h1>
          <p className="text-caption text-ink-muted48 mt-1">Company-wide updates and news.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={openAdd}>
            New Announcement
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search announcements…" className="max-w-sm" />
        <SelectField
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[{ value: "", label: "All Categories" }, ...ANNOUNCEMENT_CATEGORIES]}
          className="w-full sm:w-44"
        />
        <SelectField
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[{ value: "", label: "All Priorities" }, ...ANNOUNCEMENT_PRIORITIES]}
          className="w-full sm:w-40"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading announcements…" />
      ) : items.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-lg">
          <EmptyState title="No announcements found" description="Try different filters, or post your first announcement." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-canvas border border-hairline rounded-lg p-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.featured && <Star size={13} className="text-warning fill-warning shrink-0" />}
                      <p className="text-body-strong">{item.title}</p>
                      <span className={`text-fine-print px-2 py-0.5 rounded-pill ${PRIORITY_STYLES[item.priority]}`}>
                        {titleCase(item.priority)}
                      </span>
                      <span className="text-fine-print px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted48">
                        {titleCase(item.category)}
                      </span>
                    </div>
                    <p className="text-fine-print text-ink-muted48 mt-1">
                      {formatDate(item.startDate)}
                      {item.endDate && ` – ${formatDate(item.endDate)}`} • {audienceLabel(item)}
                    </p>
                    <p className="text-caption text-ink-muted80 mt-2">{item.description}</p>
                    {item.attachment && (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${item.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-caption text-primary hover:underline mt-2"
                      >
                        <Paperclip size={13} /> View attachment
                      </a>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
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
                  </div>
                )}
              </div>
            </div>
          ))}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Announcement" : "New Announcement"} width="max-w-xl">
        <AnnouncementForm
          initialValues={editing}
          branches={branches}
          departments={departments}
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
        title="Delete announcement?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
