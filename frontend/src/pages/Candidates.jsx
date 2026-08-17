import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { candidateService } from "../services/candidateService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import CandidateForm from "../components/recruitment/CandidateForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, initials, titleCase } from "../utils/format";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "../constants/options";

export default function Candidates() {
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    candidateService
      .list({ search: debouncedSearch || undefined, status: statusFilter || undefined, source: sourceFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setCandidates(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load candidates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter, sourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (candidate) => {
    setEditing(candidate);
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
        await candidateService.update(editing._id, form);
        toast.success("Candidate updated");
      } else {
        await candidateService.create(form);
        toast.success("Candidate added");
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
      await candidateService.remove(deleteTarget._id);
      toast.success("Candidate deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete candidate");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Candidate",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
            {initials(row.name)}
          </div>
          <div>
            <p className="text-caption-strong">{row.name}</p>
            <p className="text-fine-print text-ink-muted48">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "job", header: "Job" },
    { key: "source", header: "Source", render: (row) => titleCase(row.source) },
    { key: "experience", header: "Experience", render: (row) => `${row.experience}y` },
    { key: "expectedSalary", header: "Expected Salary", render: (row) => (row.expectedSalary ? row.expectedSalary.toLocaleString() : "—") },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "converted",
      header: "Converted",
      render: (row) => (row.convertedToEmployee ? <CheckCircle2 size={16} className="text-success" /> : <span className="text-ink-muted48">—</span>),
    },
    { key: "appliedDate", header: "Applied", render: (row) => formatDate(row.appliedDate) },
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
          <h1 className="text-display-md">Candidates</h1>
          <p className="text-caption text-ink-muted48 mt-1">Track applicants through your hiring pipeline.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Candidate
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or job…" className="max-w-sm" />
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "All Statuses" }, ...CANDIDATE_STATUSES]}
          className="w-full sm:w-44"
        />
        <SelectField
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          options={[{ value: "", label: "All Sources" }, ...CANDIDATE_SOURCES]}
          className="w-full sm:w-44"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={candidates}
          loading={loading}
          emptyTitle="No candidates found"
          emptyDescription="Try different filters, or add your first candidate."
          rowKey="_id"
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Candidate" : "Add Candidate"} width="max-w-xl">
        <CandidateForm initialValues={editing} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete candidate?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
