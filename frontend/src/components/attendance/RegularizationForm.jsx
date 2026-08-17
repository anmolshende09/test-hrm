import React, { useState } from "react";
import { TextField, TextAreaField } from "../common/FormField";
import Button from "../common/Button";

const emptyForm = { date: "", requestedCheckIn: "", requestedCheckOut: "", reason: "" };

export default function RegularizationForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.date) next.date = "Date is required";
    if (!form.requestedCheckIn) next.requestedCheckIn = "Requested check-in is required";
    if (!form.requestedCheckOut) next.requestedCheckOut = "Requested check-out is required";
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
      <TextField label="Date" type="date" required value={form.date} error={errors.date} onChange={set("date")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Requested Check In" type="time" required value={form.requestedCheckIn} error={errors.requestedCheckIn} onChange={set("requestedCheckIn")} />
        <TextField label="Requested Check Out" type="time" required value={form.requestedCheckOut} error={errors.requestedCheckOut} onChange={set("requestedCheckOut")} />
      </div>
      <TextAreaField label="Reason" required value={form.reason} error={errors.reason} onChange={set("reason")} placeholder="Why does this day's attendance need correcting?" />

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
