import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { OFFER_STATUSES } from "../../constants/options";
import { toInputDate } from "../../utils/format";

const emptyForm = { candidate: "", salary: "", startDate: "", expiryDate: "", status: "pending" };

export default function OfferForm({ initialValues, candidates, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        candidate: initialValues.candidate?._id || initialValues.candidate || "",
        salary: initialValues.salary ?? "",
        startDate: toInputDate(initialValues.startDate),
        expiryDate: toInputDate(initialValues.expiryDate),
        status: initialValues.status || "pending",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.candidate) next.candidate = "Candidate is required";
    if (!form.salary) next.salary = "Salary is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.expiryDate) next.expiryDate = "Expiry date is required";
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
      <SelectField
        label="Candidate"
        required
        placeholder="Select candidate"
        value={form.candidate}
        error={errors.candidate}
        onChange={set("candidate")}
        options={candidates.map((c) => ({ value: c._id, label: `${c.name} (${c.job})` }))}
        disabled={!!initialValues}
      />
      <TextField label="Offered Salary" type="number" min="0" required value={form.salary} error={errors.salary} onChange={set("salary")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="Expiry Date" type="date" required value={form.expiryDate} error={errors.expiryDate} onChange={set("expiryDate")} />
      </div>
      <SelectField label="Status" value={form.status} onChange={set("status")} options={OFFER_STATUSES} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Create offer"}
        </Button>
      </div>
    </form>
  );
}
