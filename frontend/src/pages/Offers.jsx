import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { offerService } from "../services/offerService";
import { candidateService } from "../services/candidateService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import OfferForm from "../components/recruitment/OfferForm";
import { formatDate } from "../utils/format";
import { OFFER_STATUSES } from "../constants/options";

export default function Offers() {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

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
    offerService
      .list({ status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setOffers(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load offers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (offer) => {
    setEditing(offer);
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
        await offerService.update(editing._id, form);
        toast.success("Offer updated");
      } else {
        await offerService.create(form);
        toast.success("Offer created");
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
      await offerService.remove(deleteTarget._id);
      toast.success("Offer deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete offer");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "candidate", header: "Candidate", render: (row) => row.candidate?.name || "Unknown" },
    { key: "salary", header: "Salary", render: (row) => row.salary.toLocaleString() },
    { key: "startDate", header: "Start Date", render: (row) => formatDate(row.startDate) },
    { key: "expiryDate", header: "Expiry Date", render: (row) => formatDate(row.expiryDate) },
    { key: "createdAt", header: "Offer Date", render: (row) => formatDate(row.createdAt) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            aria-label="Edit offer"
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label="Delete offer"
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
          <h1 className="text-display-md">Offers</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage offer letters extended to candidates.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Create Offer
        </Button>
      </div>

      <SelectField
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        options={[{ value: "", label: "All Statuses" }, ...OFFER_STATUSES]}
        className="w-full sm:w-44"
      />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={offers}
          loading={loading}
          emptyTitle="No offers yet"
          emptyDescription="Create an offer for a candidate to get started."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Offer" : "Create Offer"}>
        <OfferForm initialValues={editing} candidates={candidates} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete offer?"
        description="This will permanently remove this offer record."
        confirmLabel="Delete"
      />
    </div>
  );
}
