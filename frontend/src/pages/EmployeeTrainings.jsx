import React, { useEffect, useState } from "react";
import { Plus, Users, Pencil, Trash2, Eye, GraduationCap, Download } from "lucide-react";
import { employeeTrainingService } from "../services/employeeTrainingService";
import { trainingProgramService } from "../services/trainingProgramService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import AssignTrainingForm from "../components/employeeTraining/AssignTrainingForm";
import BulkAssignTrainingForm from "../components/employeeTraining/BulkAssignTrainingForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "enrolled", label: "Enrolled" },
  { value: "in_progress", label: "In-progress" },
  { value: "completed", label: "Completed" },
];

const STATUS_LABELS = { enrolled: "Enrolled", in_progress: "In-progress", completed: "Completed" };

export default function EmployeeTrainings() {
  const toast = useToast();
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ all: 0, enrolled: 0, in_progress: 0, completed: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [programFilter, setProgramFilter] = useState("");
  const [statusTab, setStatusTab] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
    trainingProgramService.all().then(({ data }) => setTrainingPrograms(data.data)).catch(() => {});
  }, []);

  const loadCounts = () => {
    employeeTrainingService.statusCounts({ trainingProgram: programFilter || undefined }).then(({ data }) => setStatusCounts(data.data)).catch(() => {});
  };

  const load = (page = 1) => {
    setLoading(true);
    employeeTrainingService
      .list({ search: debouncedSearch || undefined, trainingProgram: programFilter || undefined, status: statusTab || undefined, page, limit: 10 })
      .then(({ data }) => {
        setTrainings(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load employee trainings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    loadCounts();
  }, [debouncedSearch, programFilter, statusTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (training) => {
    setEditing(training);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const buildFormData = (form, certificate) => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (certificate) formData.append("certificate", certificate);
    return formData;
  };

  const handleSubmit = async (form, certificate) => {
    setSubmitting(true);
    try {
      const formData = buildFormData(form, certificate);
      if (editing) {
        await employeeTrainingService.update(editing._id, formData);
        toast.success("Training record updated");
      } else {
        await employeeTrainingService.create(formData);
        toast.success("Training assigned");
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

  const handleBulkAssign = async (payload) => {
    setBulkSubmitting(true);
    try {
      const { data } = await employeeTrainingService.bulkAssign(payload);
      toast.success(data.message || "Employees assigned");
      setBulkOpen(false);
      load(1);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't bulk assign");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const openView = async (training) => {
    try {
      const { data } = await employeeTrainingService.get(training._id);
      setViewTarget(data.data);
    } catch {
      toast.error("Couldn't load training record");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeTrainingService.remove(deleteTarget._id);
      toast.success("Training record deleted");
      setDeleteTarget(null);
      load(pagination.page);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete training record");
    } finally {
      setDeleting(false);
    }
  };

  const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap size={16} />
          </div>
          <div>
            <span className="text-caption-strong block">{row.employee?.name}</span>
            <span className="text-fine-print text-ink-muted48">{row.employee?.employeeId}</span>
          </div>
        </div>
      ),
    },
    { key: "program", header: "Training Program", render: (row) => row.trainingProgram?.name || "—" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "assignedDate", header: "Assigned", render: (row) => formatDate(row.assignedDate) },
    { key: "completionDate", header: "Completed", render: (row) => (row.completionDate ? formatDate(row.completionDate) : "—") },
    {
      key: "score",
      header: "Score / Result",
      render: (row) =>
        row.score != null ? (
          <span className={`text-caption-strong ${row.result === "failed" ? "text-danger" : row.result === "passed" ? "text-success" : "text-ink-muted80"}`}>
            {row.score}% {row.result ? `— ${row.result === "passed" ? "Passed" : "Failed"}` : ""}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} aria-label="View" className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Eye size={15} />
          </button>
          <button onClick={() => openEdit(row)} aria-label="Edit" className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteTarget(row)} aria-label="Delete" className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger">
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
          <h1 className="text-display-md">Employee Trainings</h1>
          <p className="text-caption text-ink-muted48 mt-1">Assign training programs to employees and track progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Users} onClick={() => setBulkOpen(true)}>
            Bulk Assign
          </Button>
          <Button icon={Plus} onClick={openAdd}>
            Assign Training
          </Button>
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by employee or program…" className="max-w-sm" />
          <SelectField
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            options={[{ value: "", label: "All Programs" }, ...trainingPrograms.map((p) => ({ value: p._id, label: p.name }))]}
            className="w-full sm:w-56"
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
          data={trainings}
          loading={loading}
          emptyTitle="No training records yet"
          emptyDescription="Assign a training program to an employee to get started."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Training Record" : "Assign Training"} width="max-w-xl">
        <AssignTrainingForm
          initialValues={editing}
          employees={employees}
          trainingPrograms={trainingPrograms}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Assign Training" width="max-w-xl">
        <BulkAssignTrainingForm
          employees={employees}
          trainingPrograms={trainingPrograms}
          onSubmit={handleBulkAssign}
          onCancel={() => setBulkOpen(false)}
          submitting={bulkSubmitting}
        />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Training Record">
        {viewTarget && (
          <div className="space-y-3 text-caption">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-ink-muted48 block">Employee</span>
                <span className="text-caption-strong">{viewTarget.employee?.name}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Training Program</span>
                <span className="text-caption-strong">{viewTarget.trainingProgram?.name}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Status</span>
                <StatusBadge status={viewTarget.status} />
              </div>
              <div>
                <span className="text-ink-muted48 block">Assigned Date</span>
                <span className="text-caption-strong">{formatDate(viewTarget.assignedDate)}</span>
              </div>
              {viewTarget.completionDate && (
                <div>
                  <span className="text-ink-muted48 block">Completion Date</span>
                  <span className="text-caption-strong">{formatDate(viewTarget.completionDate)}</span>
                </div>
              )}
              {viewTarget.score != null && (
                <div>
                  <span className="text-ink-muted48 block">Score / Result</span>
                  <span className="text-caption-strong">
                    {viewTarget.score}% {viewTarget.result ? `— ${viewTarget.result === "passed" ? "Passed" : "Failed"}` : ""}
                  </span>
                </div>
              )}
            </div>
            {viewTarget.certificatePath && (
              <a
                href={`${base}${viewTarget.certificatePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-caption text-primary hover:underline"
              >
                <Download size={14} /> {viewTarget.certificateFileName || "Download Certificate"}
              </a>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete training record?"
        description="This will permanently remove this employee training record."
        confirmLabel="Delete"
      />
    </div>
  );
}
