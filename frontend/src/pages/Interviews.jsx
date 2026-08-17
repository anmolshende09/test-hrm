import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { interviewService } from "../services/interviewService";
import { candidateService } from "../services/candidateService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import InterviewForm from "../components/recruitment/InterviewForm";
import { formatDateTime, titleCase } from "../utils/format";
import { INTERVIEW_TYPES, INTERVIEW_STATUSES } from "../constants/options";

export default function Interviews() {
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    candidateService.all().then(({ data }) => setCandidates(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    interviewService
      .list({ status: statusFilter || undefined, type: typeFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setInterviews(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load interviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (interview) => {
    setEditing(interview);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        await interviewService.update(editing._id, form);
        toast.success("Interview updated");
      } else {
        await interviewService.create(form);
        toast.success("Interview scheduled");
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
      await interviewService.remove(deleteTarget._id);
      toast.success("Interview deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete interview");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "candidate", header: "Candidate", render: (row) => row.candidate?.name || "Unknown" },
    { key: "round", header: "Round" },
    { key: "type", header: "Type", render: (row) => titleCase(row.type) },
    { key: "scheduledAt", header: "Date & Time", render: (row) => formatDateTime(row.scheduledAt) },
    { key: "location", header: "Location", render: (row) => row.location || "—" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "feedbackStatus", header: "Feedback", render: (row) => <StatusBadge status={row.feedbackStatus} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            aria-label="Edit interview"
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label="Delete interview"
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
          <h1 className="text-display-md">Interviews</h1>
          <p className="text-caption text-ink-muted48 mt-1">Schedule and track candidate interviews.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Schedule Interview
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "All Statuses" }, ...INTERVIEW_STATUSES]}
          className="w-full sm:w-44"
        />
        <SelectField
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[{ value: "", label: "All Types" }, ...INTERVIEW_TYPES]}
          className="w-full sm:w-44"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={interviews}
          loading={loading}
          emptyTitle="No interviews scheduled"
          emptyDescription="Schedule your first interview against a candidate."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Interview" : "Schedule Interview"}>
        <InterviewForm initialValues={editing} candidates={candidates} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete interview?"
        description="This will permanently remove this interview record."
        confirmLabel="Delete"
      />
    </div>
  );
}
