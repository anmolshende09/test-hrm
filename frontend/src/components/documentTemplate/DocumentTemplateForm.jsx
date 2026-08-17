import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FILE_FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "DOC", label: "DOC" },
  { value: "DOCX", label: "DOCX" },
];

const emptyForm = {
  name: "",
  description: "",
  category: "",
  templateContent: "",
  placeholders: [],
  defaultValues: [],
  isDefault: false,
  fileFormat: "PDF",
  status: "active",
};

export default function DocumentTemplateForm({ initialValues, categories, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: "", label: "Select category…" },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        category: initialValues.category?._id || initialValues.category || "",
        templateContent: initialValues.templateContent || "",
        placeholders: initialValues.placeholders || [],
        defaultValues: (initialValues.defaultValues || []).map((dv) => ({ key: dv.key, value: dv.value })),
        isDefault: !!initialValues.isDefault,
        fileFormat: initialValues.fileFormat || "PDF",
        status: initialValues.status || "active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const addPlaceholder = () => setForm({ ...form, placeholders: [...form.placeholders, ""] });
  const updatePlaceholder = (index, value) => {
    const next = [...form.placeholders];
    next[index] = value;
    setForm({ ...form, placeholders: next });
  };
  const removePlaceholder = (index) => setForm({ ...form, placeholders: form.placeholders.filter((_, i) => i !== index) });

  const addDefaultValue = () => setForm({ ...form, defaultValues: [...form.defaultValues, { key: "", value: "" }] });
  const updateDefaultValue = (index, field, value) => {
    const next = [...form.defaultValues];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, defaultValues: next });
  };
  const removeDefaultValue = (index) => setForm({ ...form, defaultValues: form.defaultValues.filter((_, i) => i !== index) });

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Template name is required";
    if (!form.category) next.category = "Category is required";
    if (!form.templateContent) next.templateContent = "Template content is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      placeholders: form.placeholders.filter(Boolean),
      defaultValues: form.defaultValues.filter((dv) => dv.key),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Template Name" required value={form.name} error={errors.name} onChange={set("name")} />
      <TextAreaField label="Description" rows={2} value={form.description} onChange={set("description")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Category" required value={form.category} error={errors.category} onChange={set("category")} options={categoryOptions} />
        <SelectField label="File Format" value={form.fileFormat} onChange={set("fileFormat")} options={FILE_FORMAT_OPTIONS} />
      </div>

      <div>
        <TextAreaField
          label="Template Content"
          required
          rows={8}
          value={form.templateContent}
          error={errors.templateContent}
          onChange={set("templateContent")}
          placeholder="e.g. To Whom It May Concern, this letter confirms {{employee_name}} has been employed since {{join_date}}…"
        />
        <p className="text-fine-print text-ink-muted48 mt-1">Use {"{{placeholder_name}}"} syntax — filled in automatically when the document is generated.</p>
      </div>

      {/* Placeholders */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Placeholders</label>
          <button type="button" onClick={addPlaceholder} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add placeholder
          </button>
        </div>
        {form.placeholders.length === 0 && <p className="text-fine-print text-ink-muted48">No placeholders defined.</p>}
        <div className="space-y-2">
          {form.placeholders.map((placeholder, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. employee_name"
                value={placeholder}
                onChange={(e) => updatePlaceholder(index, e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removePlaceholder(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Default Values */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Default Values</label>
          <button type="button" onClick={addDefaultValue} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add default
          </button>
        </div>
        {form.defaultValues.length === 0 && <p className="text-fine-print text-ink-muted48">No default values set.</p>}
        <div className="space-y-2">
          {form.defaultValues.map((dv, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Placeholder key, e.g. company_name"
                value={dv.key}
                onChange={(e) => updateDefaultValue(index, "key", e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <input
                type="text"
                placeholder="Default value"
                value={dv.value}
                onChange={(e) => updateDefaultValue(index, "value", e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removeDefaultValue(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-caption cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
        />
        Set as default template for this category
      </label>

      <SelectField label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Create template"}
        </Button>
      </div>
    </form>
  );
}