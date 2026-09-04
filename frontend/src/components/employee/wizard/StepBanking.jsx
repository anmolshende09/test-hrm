import React from "react";
import { TextField } from "../../common/FormField";

export default function StepBanking({ form, setForm, errors }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <h2 className="text-body-strong">Banking Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Bank Name" required value={form.bankName} error={errors.bankName} onChange={set("bankName")} placeholder="Bank of America" />
        <TextField label="Account Holder Name" required value={form.accountHolderName} error={errors.accountHolderName} onChange={set("accountHolderName")} placeholder="John Doe" />
        <TextField label="Account Number" required value={form.accountNumber} error={errors.accountNumber} onChange={set("accountNumber")} placeholder="1234567890" />
        <TextField label="Bank Identifier Code (BIC/SWIFT)" required value={form.bic} error={errors.bic} onChange={set("bic")} placeholder="BOFAUS3N" />
        <TextField label="Bank Branch" required value={form.bankBranch} error={errors.bankBranch} onChange={set("bankBranch")} placeholder="New York Main Branch" />
        <TextField label="Tax Payer ID (Optional)" value={form.taxPayerId} onChange={set("taxPayerId")} placeholder="123-45-6789" />
        <TextField label="Base Salary" type="number" required value={form.salary} error={errors.salary} onChange={set("salary")} placeholder="5000.00" />
      </div>
    </div>
  );
}
