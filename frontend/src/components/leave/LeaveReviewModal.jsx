import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { TextAreaField } from "../common/FormField";

export default function LeaveReviewModal({ open, leave, onClose, onReview, submitting }) {
  const [note, setNote] = useState("");

  if (!leave) return null;

  const handle = (status) => {
    onReview(leave._id, { status, reviewNote: note });
    setNote("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Leave Request">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-caption">
          <span className="text-ink-muted48">Employee</span>
          <span className="text-caption-strong">{leave.employee?.name}</span>
        </div>
        <div className="flex justify-between text-caption">
          <span className="text-ink-muted48">Type</span>
          <span className="text-caption-strong">{leave.leaveType}</span>
        </div>
        <div className="flex justify-between text-caption">
          <span className="text-ink-muted48">Dates</span>
          <span className="text-caption-strong">
            {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
          </span>
        </div>
        <div>
          <p className="text-caption text-ink-muted48 mb-1">Reason</p>
          <p className="text-caption text-ink-muted80">{leave.reason}</p>
        </div>
      </div>

      <TextAreaField label="Review Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the employee…" />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="danger" onClick={() => handle("rejected")} loading={submitting}>
          Reject
        </Button>
        <Button variant="primary" onClick={() => handle("approved")} loading={submitting}>
          Approve
        </Button>
      </div>
    </Modal>
  );
}
