import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { toInputDate } from "../../utils/format";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
];

const emptyForm = {
  contractNumber: "",
  employee: "",
  contractType: "",
  startDate: "",
  endDate: "",
  basicSalary: "",
  allowances: [],
  benefits: [],
  termsAndConditions: "",
  status: "draft",
};

export default function EmployeeContractForm({ initialValues, employees, contractTypes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const employeeOptions = [
    { value: "", label: "Select employee…" },
    ...employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId})` })),
  ];
  const contractTypeOptions = [
    { value: "", label: "Select contract type…" },
    ...contractTypes.map((c) => ({ value: c._id, label: c.name })),
  ];

  useEffect(() => {
    if (initialValues) {
      setForm({
        contractNumber: initialValues.contractNumber || "",
        employee: initialValues.employee?._id || initialValues.employee || "",
        contractType: initialValues.contractType?._id || initialValues.contractType || "",
        startDate: toInputDate(initialValues.startDate),
        endDate: toInputDate(initialValues.endDate),
        basicSalary: initialValues.basicSalary ?? "",
        allowances: (initialValues.allowances || []).map((a) => ({ name: a.name, amount: a.amount })),
        benefits: initialValues.benefits || [],
        termsAndConditions: initialValues.termsAndConditions || "",
        status: initialValues.status || "draft",
      });
    } else {
      setForm({ ...emptyForm, startDate: toInputDate(new Date()) });
    }
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // --- Allowances (name + amount pairs) ---
  const addAllowance = () => setForm({ ...form, allowances: [...form.allowances, { name: "", amount: "" }] });
  const updateAllowance = (index, key, value) => {
    const next = [...form.allowances];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, allowances: next });
  };
  const removeAllowance = (index) => setForm({ ...form, allowances: form.allowances.filter((_, i) => i !== index) });

  // --- Benefits (plain strings) ---
  const addBenefit = () => setForm({ ...form, benefits: [...form.benefits, ""] });
  const updateBenefit = (index, value) => {
    const next = [...form.benefits];
    next[index] = value;
    setForm({ ...form, benefits: next });
  };
  const removeBenefit = (index) => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });

  const validate = () => {
    const next = {};
    if (!form.contractNumber) next.contractNumber = "Contract number is required";
    if (!form.employee) next.employee = "Employee is required";
    if (!form.contractType) next.contractType = "Contract type is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (form.endDate && form.endDate < form.startDate) next.endDate = "End date can't be before start date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      basicSalary: form.basicSalary === "" ? null : Number(form.basicSalary),
      allowances: form.allowances
        .filter((a) => a.name)
        .map((a) => ({ name: a.name, amount: Number(a.amount) || 0 })),
      benefits: form.benefits.filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Contract Number"
          required
          value={form.contractNumber}
          error={errors.contractNumber}
          onChange={set("contractNumber")}
          placeholder="e.g. CON-2026-001"
        />
        <SelectField label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Employee" required value={form.employee} error={errors.employee} onChange={set("employee")} options={employeeOptions} />
        <SelectField label="Contract Type" required value={form.contractType} error={errors.contractType} onChange={set("contractType")} options={contractTypeOptions} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Start Date" type="date" required value={form.startDate} error={errors.startDate} onChange={set("startDate")} />
        <TextField label="End Date" type="date" value={form.endDate} error={errors.endDate} onChange={set("endDate")} placeholder="No end date" />
        <TextField label="Basic Salary" type="number" min="0" value={form.basicSalary} onChange={set("basicSalary")} />
      </div>

      {/* Allowances */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Allowances</label>
          <button type="button" onClick={addAllowance} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add allowance
          </button>
        </div>
        {form.allowances.length === 0 && <p className="text-fine-print text-ink-muted48">No allowances added.</p>}
        <div className="space-y-2">
          {form.allowances.map((allowance, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Name, e.g. Housing"
                value={allowance.name}
                onChange={(e) => updateAllowance(index, "name", e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={allowance.amount}
                onChange={(e) => updateAllowance(index, "amount", e.target.value)}
                className="w-32 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removeAllowance(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-caption-strong text-ink-muted80">Benefits</label>
          <button type="button" onClick={addBenefit} className="text-caption text-primary hover:underline flex items-center gap-1">
            <Plus size={13} /> Add benefit
          </button>
        </div>
        {form.benefits.length === 0 && <p className="text-fine-print text-ink-muted48">No benefits added.</p>}
        <div className="space-y-2">
          {form.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Health insurance"
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <button type="button" onClick={() => removeBenefit(index)} className="w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <TextAreaField label="Terms & Conditions" rows={4} value={form.termsAndConditions} onChange={set("termsAndConditions")} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Create contract"}
        </Button>
      </div>
    </form>
  );
}