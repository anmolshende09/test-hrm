import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import BranchMultiSelect from "./BranchMultiSelect";
import { HOLIDAY_CATEGORIES } from "../../constants/options";
import { toInputDate } from "../../utils/format";

const emptyForm = { title: "", holidayCategory: "", startDate: "", endDate: "", description: "", branches: [] };

export default function HolidayForm({ initialValues, branches, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        holidayCategory: initialValues.holidayCategory || "",
        startDate: toInputDate(initialValues.startDate),
        endDate: toInputDate(initialValues.endDate),
        description: initialValues.description || "",
        branches: (initialValues.branches || []).map((b) => (typeof b === "string" ? b : b._id)),
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.holidayCategory) next.holidayCategory = "Category is required";
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
      <TextField label="Title" required value={form.title} error={errors.title} onChange={set("title")} placeholder="e.g. Independence Day" />
      <SelectField
        label="Category"
        required
        placeholder="Select category"
        value={form.holidayCategory}
        error={errors.holidayCategory}
        onChange={set("holidayCategory")}
        options={HOLIDAY_CATEGORIES}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="End Date" type="date" value={form.endDate} error={errors.endDate} onChange={set("endDate")} placeholder="Same as start date if left blank" />
      </div>
      <BranchMultiSelect branches={branches} selected={form.branches} onChange={(branches) => setForm({ ...form, branches })} />
      <TextAreaField label="Description (optional)" value={form.description} onChange={set("description")} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Add holiday"}
        </Button>
      </div>
    </form>
  );
}
