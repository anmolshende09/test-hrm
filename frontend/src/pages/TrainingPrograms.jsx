import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, GraduationCap } from "lucide-react";
import { trainingProgramService } from "../services/trainingProgramService";
import { trainingTypeService } from "../services/trainingTypeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import TrainingProgramForm from "../components/trainingProgram/TrainingProgramForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatCurrency } from "../utils/format";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TrainingPrograms() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ all: 0, draft: 0, active: 0, completed: 0, cancelled: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusTab, setStatusTab] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    trainingTypeService.all().then(({ data }) => setTrainingTypes(data.data)).catch(() => {});
  }, []);

  const loadCounts = () => {
    trainingProgramService
      .statusCounts({ search: debouncedSearch || undefined, trainingType: typeFilter || undefined })
      .then(({ data }) => setStatusCounts(data.data))
      .catch(() => {});
  };

  const load = (page = 1) => {
    setLoading(true);
    trainingProgramService
      .list({
        search: debouncedSearch || undefined,
        trainingType: typeFilter || undefined,
        status: statusTab || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setPrograms(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load training programs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    loadCounts();
  }, [debouncedSearch, typeFilter, statusTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (program) => {
    setEditing(program);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await trainingProgramService.update(editing._id, payload);
        toast.success("Training program updated");
      } else {
        await trainingProgramService.create(payload);
        toast.success("Training program created");
      }
      closeModal();
      load(pagination.page);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (program) => {
    try {
      const { data } = await trainingProgramService.get(program._id);
      setViewTarget(data.data);
    } catch {
      toast.error("Couldn't load training program");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await trainingProgramService.remove(deleteTarget._id);
      toast.success("Training program deleted");
      setDeleteTarget(null);
      load(pagination.page);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete training program");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "index",
      header: "#",
      render: (row) => <span className="text-caption text-ink-muted48">{(pagination.page - 1) * 10 + programs.indexOf(row) + 1}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap size={16} />
          </div>
          <div>
            <span className="text-caption-strong block">{row.name}</span>
            <span className="text-fine-print text-ink-muted48">{row.trainingType?.name}</span>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "durationHours", header: "Duration", render: (row) => `${row.durationHours} hours` },
    { key: "cost", header: "Cost", render: (row) => (row.cost != null ? formatCurrency(row.cost) : "—") },
    { key: "capacity", header: "Capacity", render: (row) => row.capacity },
    {
      key: "flags",
      header: "Flags",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.selfEnrollment && (
            <span className="text-fine-print px-2 py-0.5 rounded-pill bg-primary/10 text-primary">Self-Enrollment</span>
          )}
          {row.mandatory && <span className="text-fine-print px-2 py-0.5 rounded-pill bg-danger-soft text-danger">Mandatory</span>}
          {!row.selfEnrollment && !row.mandatory && <span className="text-caption text-ink-muted48">—</span>}
        </div>
      ),
    },
    { key: "sessionCount", header: "Sessions", render: (row) => row.sessionCount ?? 0 },
    { key: "employeeCount", header: "Employees", render: (row) => row.employeeCount ?? 0 },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} aria-label={`View ${row.name}`} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Eye size={15} />
          </button>
          <button onClick={() => openEdit(row)} aria-label={`Edit ${row.name}`} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteTarget(row)} aria-label={`Delete ${row.name}`} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger">
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
          <h1 className="text-display-md">Training Programs</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage training programs available for your employees.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Training Program
        </Button>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search..." className="max-w-sm" />
          <SelectField
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[{ value: "", label: "All Types" }, ...trainingTypes.map((t) => ({ value: t._id, label: t.name }))]}
            className="w-full sm:w-52"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusTab(tab.value)}
              className={`px-3.5 py-1.5 rounded-pill text-caption-strong transition-colors ${
                statusTab === tab.value ? "bg-success text-white" : "text-ink-muted48 hover:bg-canvas-parchment"
              }`}
            >
              {tab.label} <span className="opacity-70">{statusCounts[tab.value || "all"] ?? 0}</span>
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={programs}
          loading={loading}
          emptyTitle="No training programs yet"
          emptyDescription="Add your first training program to make it available for employees."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Training Program" : "Add New Training Program"} width="max-w-xl">
        <TrainingProgramForm
          initialValues={editing}
          trainingTypes={trainingTypes}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.name || "Training Program"}>
        {viewTarget && (
          <div className="space-y-3 text-caption">
            <div>
              <span className="text-ink-muted48 block">Training Type</span>
              <span className="text-caption-strong">{viewTarget.trainingType?.name}</span>
            </div>
            {viewTarget.description && (
              <div>
                <span className="text-ink-muted48 block">Description</span>
                <span className="text-ink-muted80">{viewTarget.description}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-ink-muted48 block">Duration</span>
                <span className="text-caption-strong">{viewTarget.durationHours} hours</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Cost</span>
                <span className="text-caption-strong">{viewTarget.cost != null ? formatCurrency(viewTarget.cost) : "—"}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Capacity</span>
                <span className="text-caption-strong">{viewTarget.capacity}</span>
              </div>
            </div>
            <div>
              <span className="text-ink-muted48 block">Trainer</span>
              <span className="text-caption-strong capitalize">{viewTarget.trainerType} — {viewTarget.trainerName}</span>
            </div>
            <div>
              <span className="text-ink-muted48 block">Status</span>
              <StatusBadge status={viewTarget.status} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete training program?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
