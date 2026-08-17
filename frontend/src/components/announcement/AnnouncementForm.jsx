import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import CheckboxMultiSelect from "../common/CheckboxMultiSelect";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES, AUDIENCE_TYPES } from "../../constants/options";
import { toInputDate } from "../../utils/format";

const emptyForm = {
  title: "",
  description: "",
  category: "general",
  priority: "medium",
  featured: false,
  audienceType: "company_wide",
  audienceBranches: [],
  audienceDepartments: [],
  startDate: "",
  endDate: "",
};

export default function AnnouncementForm({ initialValues, branches, departments, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        category: initialValues.category || "general",
        priority: initialValues.priority || "medium",
        featured: !!initialValues.featured,
        audienceType: initialValues.audienceType || "company_wide",
        audienceBranches: (initialValues.audienceBranches || []).map((b) => (typeof b === "string" ? b : b._id)),
        audienceDepartments: (initialValues.audienceDepartments || []).map((d) => (typeof d === "string" ? d : d._id)),
        startDate: toInputDate(initialValues.startDate),
        endDate: toInputDate(initialValues.endDate),
      });
    } else {
      setForm({ ...emptyForm, startDate: toInputDate(new Date()) });
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.description) next.description = "Description is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (form.endDate && form.endDate < form.startDate) next.endDate = "End date can't be before start date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form, attachment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Title" required value={form.title} error={errors.title} onChange={set("title")} />
      <TextAreaField label="Description" required rows={4} value={form.description} error={errors.description} onChange={set("description")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Category" value={form.category} onChange={set("category")} options={ANNOUNCEMENT_CATEGORIES} />
        <SelectField label="Priority" value={form.priority} onChange={set("priority")} options={ANNOUNCEMENT_PRIORITIES} />
      </div>

      <label className="flex items-center gap-2 text-caption cursor-pointer">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
        />
        Feature this announcement <span className="text-ink-muted48">(pinned to the top)</span>
      </label>

      <SelectField label="Audience" value={form.audienceType} onChange={set("audienceType")} options={AUDIENCE_TYPES} />

      {form.audienceType === "branch" && (
        <CheckboxMultiSelect
          label="Branches"
          items={branches}
          selected={form.audienceBranches}
          onChange={(audienceBranches) => setForm({ ...form, audienceBranches })}
          emptyMessage="No branches yet."
        />
      )}
      {form.audienceType === "department" && (
        <CheckboxMultiSelect
          label="Departments"
          items={departments}
          selected={form.audienceDepartments}
          onChange={(audienceDepartments) => setForm({ ...form, audienceDepartments })}
          emptyMessage="No departments yet."
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="End Date (optional)" type="date" value={form.endDate} error={errors.endDate} onChange={set("endDate")} placeholder="No expiry" />
      </div>

      <div>
        <label className="block text-caption-strong text-ink-muted80 mb-1.5">Attachment (optional)</label>
        {initialValues?.attachment && !attachment && (
          <p className="text-fine-print text-ink-muted48 mb-1.5">
            Current file attached — choose a new one below to replace it.
          </p>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,.pdf,.doc,.docx"
          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Post announcement"}
        </Button>
      </div>
    </form>
  );
}
