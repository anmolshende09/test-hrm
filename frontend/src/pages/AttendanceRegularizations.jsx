import React, { useEffect, useState } from "react";
import { Plus, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { regularizationService } from "../services/regularizationService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import { SelectField } from "../components/common/FormField";
import RegularizationForm from "../components/attendance/RegularizationForm";
import RegularizationReviewModal from "../components/attendance/RegularizationReviewModal";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AttendanceRegularizations() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");

  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    const params = { status: statusFilter || undefined, page, limit: 10 };
    if (canManage) {
      params.search = debouncedSearch || undefined;
    } else {
      params.employee = user?.employee?._id || user?.employee;
    }
    regularizationService
      .list(params)
      .then(({ data }) => {
        setRequests(data.data);
        setStats(data.stats);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load regularization requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async (form) => {
    setSubmitting(true);
    try {
      await regularizationService.create({ ...form, employee: user?.employee?._id || user?.employee });
      toast.success("Regularization request submitted");
      setApplyOpen(false);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id, payload) => {
    setReviewing(true);
    try {
      await regularizationService.review(id, payload);
      toast.success(`Request ${payload.status}`);
      setReviewTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't review request");
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    ...(canManage ? [{ key: "employee", header: "Employee", render: (row) => row.employee?.name || "Unknown" }] : []),
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "original", header: "Original", render: (row) => `${row.originalCheckIn || "—"} – ${row.originalCheckOut || "—"}` },
    { key: "requested", header: "Requested", render: (row) => `${row.requestedCheckIn} – ${row.requestedCheckOut}` },
    { key: "reason", header: "Reason", render: (row) => <span className="line-clamp-1 max-w-xs inline-block">{row.reason}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            render: (row) =>
              row.status === "pending" ? (
                <Button size="sm" variant="secondary" onClick={() => setReviewTarget(row)}>
                  Review
                </Button>
              ) : (
                "—"
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Attendance Regularizations</h1>
          <p className="text-caption text-ink-muted48 mt-1">
            {canManage ? "Review employee attendance correction requests." : "Request a correction to your attendance record."}
          </p>
        </div>
        {!canManage && (
          <Button icon={Plus} onClick={() => setApplyOpen(true)}>
            Request Correction
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Pending" count={stats.pending} icon={Hourglass} theme="amber" />
          <StatCard title="Approved" count={stats.approved} icon={CheckCircle2} theme="green" />
          <StatCard title="Rejected" count={stats.rejected} icon={XCircle} theme="red" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {canManage && <SearchBar value={search} onChange={setSearch} placeholder="Search by employee name…" className="max-w-sm" />}
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]}
          className="w-full sm:w-44"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyTitle="No regularization requests"
          emptyDescription={canManage ? "Requests submitted by employees will appear here." : "You haven't requested any corrections yet."}
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Request Attendance Correction">
        <RegularizationForm onSubmit={handleApply} onCancel={() => setApplyOpen(false)} submitting={submitting} />
      </Modal>

      <RegularizationReviewModal
        open={!!reviewTarget}
        request={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onReview={handleReview}
        submitting={reviewing}
      />
    </div>
  );
}
