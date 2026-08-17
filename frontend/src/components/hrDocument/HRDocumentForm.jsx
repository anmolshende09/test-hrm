import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { toInputDate } from "../../utils/format";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  version: "1.0",
  status: "draft",
  effectiveDate: "",
  expiryDate: "",
  requiresAcknowledgment: false,
};

export default function HRDocumentForm({ initialValues, categories, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);

  const categoryOptions = [
    { value: "", label: "Select category…" },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        category: initialValues.category?._id || initialValues.category || "",
        version: initialValues.version || "1.0",
        status: initialValues.status || "draft",
        effectiveDate: toInputDate(initialValues.effectiveDate),
        expiryDate: toInputDate(initialValues.expiryDate),
        requiresAcknowledgment: !!initialValues.requiresAcknowledgment,
      });
    } else {
      setForm(emptyForm);
    }
    setFile(null);
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.category) next.category = "Category is required";
    if (!initialValues && !file) next.file = "A file is required";
    if (form.expiryDate && form.effectiveDate && form.expiryDate < form.effectiveDate) {
      next.expiryDate = "Expiry date can't be before the effective date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form, file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Title" required value={form.title} error={errors.title} onChange={set("title")} />
      <TextAreaField label="Description" rows={3} value={form.description} onChange={set("description")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Category" required value={form.category} error={errors.category} onChange={set("category")} options={categoryOptions} />
        <TextField label="Version" value={form.version} onChange={set("version")} placeholder="e.g. 1.0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Effective Date" type="date" value={form.effectiveDate} onChange={set("effectiveDate")} />
        <TextField label="Expiry Date" type="date" value={form.expiryDate} error={errors.expiryDate} onChange={set("expiryDate")} placeholder="No expiry" />
      </div>

      <SelectField label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />

      <label className="flex items-center gap-2 text-caption cursor-pointer">
        <input
          type="checkbox"
          checked={form.requiresAcknowledgment}
          onChange={(e) => setForm({ ...form, requiresAcknowledgment: e.target.checked })}
          className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
        />
        Employees must acknowledge they've read this document
      </label>

      <div>
        <label className="block text-caption-strong text-ink-muted80 mb-1.5">
          File {!initialValues && <span className="text-danger">*</span>}
        </label>
        {initialValues?.fileName && !file && (
          <p className="text-fine-print text-ink-muted48 mb-1.5">
            Current file: {initialValues.fileName} — choose a new one below to replace it.
          </p>
        )}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
        />
        {errors.file && <p className="text-fine-print text-danger mt-1">{errors.file}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Upload document"}
        </Button>
      </div>
    </form>
  );
}