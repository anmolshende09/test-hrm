import React, { useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { LEAVE_TYPES } from "../../constants/options";

const emptyForm = { leaveType: "", startDate: "", endDate: "", reason: "" };

export default function LeaveForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.leaveType) next.leaveType = "Leave type is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.endDate) next.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "End date can't be before start date";
    }
    if (!form.reason) next.reason = "Reason is required";
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
        label="Leave Type"
        required
        placeholder="Select leave type"
        value={form.leaveType}
        error={errors.leaveType}
        onChange={set("leaveType")}
        options={LEAVE_TYPES}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="End Date" type="date" required value={form.endDate} error={errors.endDate} onChange={set("endDate")} />
      </div>
      <TextAreaField label="Reason" required value={form.reason} error={errors.reason} onChange={set("reason")} placeholder="Briefly describe your reason for leave" />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Submit request
        </Button>
      </div>
    </form>
  );
}
