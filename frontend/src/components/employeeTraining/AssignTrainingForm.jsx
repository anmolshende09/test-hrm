import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { toInputDate } from "../../utils/format";

const STATUS_OPTIONS = [
  { value: "enrolled", label: "Enrolled" },
  { value: "in_progress", label: "In-progress" },
  { value: "completed", label: "Completed" },
];

const RESULT_OPTIONS = [
  { value: "", label: "No result yet" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

const emptyForm = {
  employee: "",
  trainingProgram: "",
  status: "enrolled",
  assignedDate: "",
  completionDate: "",
  score: "",
  result: "",
};

export default function AssignTrainingForm({ initialValues, employees, trainingPrograms, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [certificate, setCertificate] = useState(null);

  const employeeOptions = [
    { value: "", label: "Select Employee" },
    ...employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId})` })),
  ];
  const programOptions = [
    { value: "", label: "Select Training Program" },
    ...trainingPrograms.map((p) => ({ value: p._id, label: p.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        employee: initialValues.employee?._id || initialValues.employee || "",
        trainingProgram: initialValues.trainingProgram?._id || initialValues.trainingProgram || "",
        status: initialValues.status || "enrolled",
        assignedDate: toInputDate(initialValues.assignedDate),
        completionDate: toInputDate(initialValues.completionDate),
        score: initialValues.score ?? "",
        result: initialValues.result || "",
      });
    } else {
      setForm({ ...emptyForm, assignedDate: toInputDate(new Date()) });
    }
    setCertificate(null);
    setErrors({});
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.employee) next.employee = "Employee is required";
    if (!form.trainingProgram) next.trainingProgram = "Training program is required";
    if (!form.status) next.status = "Status is required";
    if (!form.assignedDate) next.assignedDate = "Assigned date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      { ...form, score: form.score === "" ? "" : Number(form.score) },
      certificate
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField label="Employee" required value={form.employee} error={errors.employee} onChange={set("employee")} options={employeeOptions} />
      <SelectField label="Training Program" required value={form.trainingProgram} error={errors.trainingProgram} onChange={set("trainingProgram")} options={programOptions} />
      <SelectField label="Status" required value={form.status} error={errors.status} onChange={set("status")} options={STATUS_OPTIONS} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Assigned Date" type="date" required value={form.assignedDate} error={errors.assignedDate} onChange={set("assignedDate")} />
        <TextField label="Completion Date" type="date" value={form.completionDate} onChange={set("completionDate")} placeholder="dd-mm-yyyy" />
      </div>

      {form.status === "completed" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Score (%)" type="number" min="0" max="100" value={form.score} onChange={set("score")} />
          <SelectField label="Result" value={form.result} onChange={set("result")} options={RESULT_OPTIONS} />
        </div>
      )}

      <div>
        <label className="block text-caption-strong text-ink-muted80 mb-1.5">Certification</label>
        {initialValues?.certificateFileName && !certificate && (
          <p className="text-fine-print text-ink-muted48 mb-1.5">Current: {initialValues.certificateFileName} — choose a new file to replace it.</p>
        )}
        <input
          type="file"
          accept=".pdf,image/png,image/jpeg"
          onChange={(e) => setCertificate(e.target.files?.[0] || null)}
          className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
        />
      </div>

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
