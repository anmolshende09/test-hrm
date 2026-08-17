import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { CALENDAR_CATEGORIES } from "../../constants/options";
import { toInputDate } from "../../utils/format";

const emptyForm = { title: "", category: "holiday", startDate: "", endDate: "", description: "" };

export default function CalendarEventForm({ initialValues, defaultDate, onSubmit, onCancel, onDelete, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        category: initialValues.category || "holiday",
        startDate: toInputDate(initialValues.startDate),
        endDate: toInputDate(initialValues.endDate),
        description: initialValues.description || "",
      });
    } else {
      const d = defaultDate ? toInputDate(defaultDate) : "";
      setForm({ ...emptyForm, startDate: d, endDate: d });
    }
  }, [initialValues, defaultDate]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (form.endDate && form.endDate < form.startDate) next.endDate = "End date can't be before start date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, endDate: form.endDate || form.startDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField label="Type" required value={form.category} onChange={set("category")} options={CALENDAR_CATEGORIES} />
      <TextField label="Title" required value={form.title} error={errors.title} onChange={set("title")} placeholder="e.g. Company Foundation Day" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="End Date" type="date" value={form.endDate} error={errors.endDate} onChange={set("endDate")} placeholder="Same as start date if left blank" />
      </div>
      <TextAreaField label="Description (optional)" value={form.description} onChange={set("description")} />

      <div className="flex justify-between items-center pt-2">
        {initialValues && onDelete ? (
          <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={submitting}>
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initialValues ? "Save changes" : "Add event"}
          </Button>
        </div>
      </div>
    </form>
  );
}
