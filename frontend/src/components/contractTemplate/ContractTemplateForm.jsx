import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const emptyForm = {
  name: "",
  description: "",
  contractType: "",
  templateContent: "",
  variables: [],
  clauses: [],
  isDefault: false,
  status: "active",
};

export default function ContractTemplateForm({ initialValues, contractTypes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const contractTypeOptions = [
    { value: "", label: "Select contract type…" },
    ...contractTypes.map((c) => ({ value: c._id, label: c.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        contractType: initialValues.contractType?._id || initialValues.contractType || "",
        templateContent: initialValues.templateContent || "",
        variables: initialValues.variables || [],
        clauses: initialValues.clauses || [],
        isDefault: !!initialValues.isDefault,
        status: initialValues.status || "active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const addVariable = () => setForm({ ...form, variables: [...form.variables, ""] });
  const updateVariable = (index, value) => {
    const next = [...form.variables];
    next[index] = value;
    setForm({ ...form, variables: next });
  };
  const removeVariable = (index) => setForm({ ...form, variables: form.variables.filter((_, i) => i !== index) });

  const addClause = () => setForm({ ...form, clauses: [...form.clauses, ""] });
  const updateClause = (index, value) => {
    const next = [...form.clauses];
    next[index] = value;
    setForm({ ...form, clauses: next });
  };
  const removeClause = (index) => setForm({ ...form, clauses: form.clauses.filter((_, i) => i !== index) });

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Template name is required";
    if (!form.contractType) next.contractType = "Contract type is required";
    if (!form.templateContent) next.templateContent = "Template content is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      variables: form.variables.filter(Boolean),
      clauses: form.clauses.filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Template Name" required value={form.name} error={errors.name} onChange={set("name")} />
      <TextAreaField label="Description" rows={2} value={form.description} onChange={set("description")} />
      <SelectField label="Contract Type" required value={form.contractType} error={errors.contractType} onChange={set("contractType")} options={contractTypeOptions} />

      <div>
        <TextAreaField
          label="Template Content"
          required
          rows={8}
          value={form.templateContent}
          error={errors.templateContent}
          onChange={set("templateContent")}
          placeholder="e.g. This agreement is between {{company_name}} and {{employee_name}}, effective {{start_date}}…"
        />
        <p className="text-fine-print text-ink-muted48 mt-1">Use {"{{variable_name}}"} placeholders — they'll be filled in when a contract is generated from this template.</p>
      </div>

      {/* Variables */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Variables</label>
          <button type="button" onClick={addVariable} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add variable
          </button>
        </div>
        {form.variables.length === 0 && <p className="text-fine-print text-ink-muted48">No variables defined.</p>}
        <div className="space-y-2">
          {form.variables.map((variable, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. employee_name"
                value={variable}
                onChange={(e) => updateVariable(index, e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removeVariable(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clauses */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Standard Clauses</label>
          <button type="button" onClick={addClause} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add clause
          </button>
        </div>
        {form.clauses.length === 0 && <p className="text-fine-print text-ink-muted48">No clauses added.</p>}
        <div className="space-y-2">
          {form.clauses.map((clause, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                rows={2}
                placeholder="e.g. Confidentiality clause text…"
                value={clause}
                onChange={(e) => updateClause(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removeClause(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0 mt-1">
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
        Set as default template for this contract type
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