import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { leaveService } from "../services/leaveService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import LeaveForm from "../components/leave/LeaveForm";
import LeaveReviewModal from "../components/leave/LeaveReviewModal";
import { formatDate, titleCase } from "../utils/format";

export default function Leaves() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(searchParams.get("action") === "apply");
  const [submitting, setSubmitting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const load = () => {
    setLoading(true);
    const query = canManage ? {} : { employee: user?.employee?._id || user?.employee };
    leaveService
      .list(query)
      .then(({ data }) => setLeaves(data.data))
      .catch(() => toast.error("Couldn't load leave requests"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeApply = () => {
    setApplyOpen(false);
    if (searchParams.get("action")) setSearchParams({});
  };

  const handleApply = async (form) => {
    setSubmitting(true);
    try {
      await leaveService.apply({ ...form, employee: user?.employee?._id || user?.employee });
      toast.success("Leave request submitted");
      closeApply();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id, payload) => {
    setReviewing(true);
    try {
      await leaveService.review(id, payload);
      toast.success(`Leave request ${payload.status}`);
      setReviewTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't review request");
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    ...(canManage ? [{ key: "employee", header: "Employee", render: (row) => row.employee?.name || "Unknown" }] : []),
    { key: "leaveType", header: "Type", render: (row) => titleCase(row.leaveType) },
    { key: "startDate", header: "Start", render: (row) => formatDate(row.startDate) },
    { key: "endDate", header: "End", render: (row) => formatDate(row.endDate) },
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
          <h1 className="text-display-md">Leave Requests</h1>
          <p className="text-caption text-ink-muted48 mt-1">
            {canManage ? "Review and manage employee leave requests." : "Apply for leave and track your requests."}
          </p>
        </div>
        {!canManage && (
          <Button icon={Plus} onClick={() => setApplyOpen(true)}>
            Apply for Leave
          </Button>
        )}
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={leaves} loading={loading} emptyTitle="No leave requests" emptyDescription={canManage ? "Requests submitted by employees will appear here." : "You haven't applied for leave yet."} />
      </div>

      <Modal open={applyOpen} onClose={closeApply} title="Apply for Leave">
        <LeaveForm onSubmit={handleApply} onCancel={closeApply} submitting={submitting} />
      </Modal>

      <LeaveReviewModal
        open={!!reviewTarget}
        leave={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onReview={handleReview}
        submitting={reviewing}
      />
    </div>
  );
}
