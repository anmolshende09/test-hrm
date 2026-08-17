import React, { useEffect, useState } from "react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TRAINER_TYPE_OPTIONS = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
];

const emptyForm = {
  name: "",
  trainingType: "",
  description: "",
  durationHours: "",
  cost: "",
  capacity: "",
  trainerType: "internal",
  trainerName: "",
  status: "draft",
  selfEnrollment: false,
  mandatory: false,
};

export default function TrainingProgramForm({ initialValues, trainingTypes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const trainingTypeOptions = [
    { value: "", label: "Select Training Type" },
    ...trainingTypes.map((t) => ({ value: t._id, label: t.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        trainingType: initialValues.trainingType?._id || initialValues.trainingType || "",
        description: initialValues.description || "",
        durationHours: initialValues.durationHours ?? "",
        cost: initialValues.cost ?? "",
        capacity: initialValues.capacity ?? "",
        trainerType: initialValues.trainerType || "internal",
        trainerName: initialValues.trainerName || "",
        status: initialValues.status || "draft",
        selfEnrollment: !!initialValues.selfEnrollment,
        mandatory: !!initialValues.mandatory,
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
    if (!form.trainingType) next.trainingType = "Training type is required";
    if (form.durationHours === "") next.durationHours = "Duration is required";
    if (form.capacity === "") next.capacity = "Capacity is required";
    if (!form.trainerName) next.trainerName = "Trainer name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      durationHours: Number(form.durationHours),
      cost: form.cost === "" ? null : Number(form.cost),
      capacity: Number(form.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Name" required value={form.name} error={errors.name} onChange={set("name")} placeholder="e.g. Advanced Leadership Program" />
      <SelectField label="Training Type" required value={form.trainingType} error={errors.trainingType} onChange={set("trainingType")} options={trainingTypeOptions} />
      <TextAreaField
        label="Description"
        rows={3}
        value={form.description}
        onChange={set("description")}
        placeholder="e.g. A comprehensive program designed to develop leadership skills..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Duration (hours)" required type="number" min="0" value={form.durationHours} error={errors.durationHours} onChange={set("durationHours")} placeholder="e.g. 8" />
        <TextField label="Cost" type="number" min="0" step="0.01" value={form.cost} onChange={set("cost")} placeholder="e.g. 500.00" />
        <TextField label="Capacity" required type="number" min="1" value={form.capacity} error={errors.capacity} onChange={set("capacity")} placeholder="e.g. 20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Trainer Type" value={form.trainerType} onChange={set("trainerType")} options={TRAINER_TYPE_OPTIONS} />
        <TextField
          label="Trainer Name"
          required
          value={form.trainerName}
          error={errors.trainerName}
          onChange={set("trainerName")}
          placeholder={form.trainerType === "internal" ? "e.g. Jane Smith" : "e.g. Acme Training Co."}
        />
      </div>

      <SelectField label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-caption cursor-pointer">
          <input
            type="checkbox"
            checked={form.selfEnrollment}
            onChange={(e) => setForm({ ...form, selfEnrollment: e.target.checked })}
            className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
          />
          Allow self-enrollment
        </label>
        <label className="flex items-center gap-2 text-caption cursor-pointer">
          <input
            type="checkbox"
            checked={form.mandatory}
            onChange={(e) => setForm({ ...form, mandatory: e.target.checked })}
            className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
          />
          This training is mandatory
        </label>
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
