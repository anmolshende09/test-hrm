import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { TextAreaField } from "../common/FormField";
import { formatDate } from "../../utils/format";

export default function RegularizationReviewModal({ open, request, onClose, onReview, submitting }) {
  const [note, setNote] = useState("");

  if (!request) return null;

  const handle = (status) => {
    onReview(request._id, { status, reviewNote: note });
    setNote("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Regularization Request">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-caption">
          <span className="text-ink-muted48">Employee</span>
          <span className="text-caption-strong">{request.employee?.name}</span>
        </div>
        <div className="flex justify-between text-caption">
          <span className="text-ink-muted48">Date</span>
          <span className="text-caption-strong">{formatDate(request.date)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider-soft">
          <div>
            <p className="text-fine-print text-ink-muted48 mb-1">Original</p>
            <p className="text-caption text-ink-muted80">
              {request.originalCheckIn || "—"} – {request.originalCheckOut || "—"}
            </p>
          </div>
          <div>
            <p className="text-fine-print text-ink-muted48 mb-1">Requested</p>
            <p className="text-caption-strong text-primary">
              {request.requestedCheckIn} – {request.requestedCheckOut}
            </p>
          </div>
        </div>
        <div>
          <p className="text-caption text-ink-muted48 mb-1">Reason</p>
          <p className="text-caption text-ink-muted80">{request.reason}</p>
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
