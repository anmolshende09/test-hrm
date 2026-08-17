import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../common/FormField";
import Button from "../common/Button";

const ROLE_OPTIONS = [
  { value: "", label: "Select Role" },
  { value: "admin", label: "Admin" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "employee", label: "Employee" },
];

const emptyForm = { name: "", email: "", password: "", confirmPassword: "", role: "" };

export default function UserForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const isEditing = !!initialValues;

  useEffect(() => {
    if (initialValues) {
      setForm({ name: initialValues.name || "", email: initialValues.email || "", password: "", confirmPassword: "", role: initialValues.role || "" });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialValues]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name) next.name = "Name is required";
    if (!form.email) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
    if (!isEditing) {
      if (!form.password) next.password = "Password is required";
      if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    }
    if (!form.role) next.role = "Role is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEditing) {
      onSubmit({ name: form.name, email: form.email, role: form.role });
    } else {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Name" required value={form.name} error={errors.name} onChange={set("name")} placeholder="e.g. John Doe" />
      <TextField label="Email" required type="email" value={form.email} error={errors.email} onChange={set("email")} placeholder="e.g. john@example.com" />

      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Password" required type="password" value={form.password} error={errors.password} onChange={set("password")} placeholder="Enter password" />
          <TextField label="Confirm Password" required type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={set("confirmPassword")} placeholder="Re-enter password" />
        </div>
      )}

      <SelectField label="Role" required value={form.role} error={errors.role} onChange={set("role")} options={ROLE_OPTIONS} />

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
