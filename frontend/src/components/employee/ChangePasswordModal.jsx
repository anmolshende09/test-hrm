import React, { useState } from "react";
import { TextField } from "../common/FormField";
import Button from "../common/Button";

export default function ChangePasswordModal({ employee, onSubmit, onCancel, submitting }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!newPassword) next.newPassword = "New password is required";
    else if (newPassword.length < 6) next.newPassword = "Must be at least 6 characters";
    if (!confirmPassword) next.confirmPassword = "Confirm password is required";
    else if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-caption text-ink-muted48">
        Set a new password for <span className="text-caption-strong text-ink-muted80">{employee?.name}</span>.
      </p>
      <TextField
        label="New Password"
        required
        type="password"
        value={newPassword}
        error={errors.newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        label="Confirm Password"
        required
        type="password"
        value={confirmPassword}
        error={errors.confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Update Password
        </Button>
      </div>
    </form>
  );
}
