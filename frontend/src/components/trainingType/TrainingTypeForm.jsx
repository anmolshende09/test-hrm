import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import CheckboxMultiSelect from "../common/CheckboxMultiSelect";

const emptyForm = {
  name: "",
  description: "",
  branch: "",
  departments: [],
  durationHours: "",
};

export default function TrainingTypeForm({ initialValues, branches, departments, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const branchOptions = [{ value: "", label: "Select Branch" }, ...branches.map((b) => ({ value: b._id, label: b.name }))];

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        branch: initialValues.branch?._id || initialValues.branch || "",
        departments: (initialValues.departments || []).map((d) => (typeof d === "string" ? d : d._id)),
        durationHours: initialValues.durationHours ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Name is required";
    if (!form.branch) next.branch = "Branch is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      durationHours: form.durationHours === "" ? null : Number(form.durationHours),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Name"
        required
        value={form.name}
        error={errors.name}
        onChange={set("name")}
        placeholder="e.g. Technical Skills Training"
      />
      <TextAreaField
        label="Description"
        rows={3}
        value={form.description}
        onChange={set("description")}
        placeholder="e.g. Training focused on improving technical skills..."
      />
      <SelectField label="Branch" required value={form.branch} error={errors.branch} onChange={set("branch")} options={branchOptions} />

      <TextField
        label="Duration (hours)"
        type="number"
        min="0"
        value={form.durationHours}
        onChange={set("durationHours")}
        placeholder="e.g. 8"
      />

      <CheckboxMultiSelect
        label="Departments"
        items={departments}
        selected={form.departments}
        onChange={(next) => setForm({ ...form, departments: next })}
        emptyMessage="No departments yet."
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
