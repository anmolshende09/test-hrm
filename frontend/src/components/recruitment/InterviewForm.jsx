import React, { useEffect, useState } from "react";
import { TextField, SelectField, TextAreaField } from "../common/FormField";
import Button from "../common/Button";
import { INTERVIEW_TYPES, INTERVIEW_STATUSES } from "../../constants/options";

const emptyForm = { candidate: "", round: "", type: "video", scheduledAt: "", location: "", status: "scheduled", feedback: "" };

const toInputDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function InterviewForm({ initialValues, candidates, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        candidate: initialValues.candidate?._id || initialValues.candidate || "",
        round: initialValues.round || "",
        type: initialValues.type || "video",
        scheduledAt: toInputDateTime(initialValues.scheduledAt),
        location: initialValues.location || "",
        status: initialValues.status || "scheduled",
        feedback: initialValues.feedback || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.candidate) next.candidate = "Candidate is required";
    if (!form.round) next.round = "Round is required";
    if (!form.scheduledAt) next.scheduledAt = "Date and time is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        label="Candidate"
        required
        placeholder="Select candidate"
        value={form.candidate}
        error={errors.candidate}
        onChange={set("candidate")}
        options={candidates.map((c) => ({ value: c._id, label: `${c.name} (${c.job})` }))}
        disabled={!!initialValues}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Round" required value={form.round} error={errors.round} onChange={set("round")} placeholder="e.g. Round 1, Technical" />
        <SelectField label="Type" value={form.type} onChange={set("type")} options={INTERVIEW_TYPES} />
      </div>
      <TextField label="Date & Time" type="datetime-local" required value={form.scheduledAt} error={errors.scheduledAt} onChange={set("scheduledAt")} />
      <TextField label="Location (optional)" value={form.location} onChange={set("location")} placeholder="e.g. Zoom link or office address" />
      <SelectField label="Status" value={form.status} onChange={set("status")} options={INTERVIEW_STATUSES} />
      {initialValues && <TextAreaField label="Feedback (optional)" value={form.feedback} onChange={set("feedback")} placeholder="Interviewer's notes and evaluation" />}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Schedule interview"}
        </Button>
      </div>
    </form>
  );
}
