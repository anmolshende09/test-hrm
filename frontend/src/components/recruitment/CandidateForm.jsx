import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "../../constants/options";

const emptyForm = { name: "", email: "", job: "", source: "other", experience: "", expectedSalary: "", status: "applied" };

export default function CandidateForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        email: initialValues.email || "",
        job: initialValues.job || "",
        source: initialValues.source || "other",
        experience: initialValues.experience ?? "",
        expectedSalary: initialValues.expectedSalary ?? "",
        status: initialValues.status || "applied",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Name is required";
    if (!form.email) next.email = "Email is required";
    if (!form.job) next.job = "Job applied for is required";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Full Name" required value={form.name} error={errors.name} onChange={set("name")} />
        <TextField label="Email" type="email" required value={form.email} error={errors.email} onChange={set("email")} />
        <TextField label="Job Applied For" required value={form.job} error={errors.job} onChange={set("job")} placeholder="e.g. Senior Software Engineer" />
        <SelectField label="Source" value={form.source} onChange={set("source")} options={CANDIDATE_SOURCES} />
        <TextField label="Experience (years)" type="number" min="0" step="0.5" value={form.experience} onChange={set("experience")} />
        <TextField label="Expected Salary (optional)" type="number" min="0" value={form.expectedSalary} onChange={set("expectedSalary")} />
        <SelectField label="Status" value={form.status} onChange={set("status")} options={CANDIDATE_STATUSES} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Add candidate"}
        </Button>
      </div>
    </form>
  );
}
