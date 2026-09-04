import React from "react";
import { TextField, SelectField } from "../../common/FormField";
import { GENDER_OPTIONS } from "../../../constants/options";

export default function StepPersonal({ form, setForm, errors, photo, setPhoto }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setForm({ ...form, _photoError: "Image must be under 2MB" });
      return;
    }
    setForm({ ...form, _photoError: "" });
    setPhoto(file || null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-body-strong">Basic Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Full Name" required value={form.name} error={errors.name} onChange={set("name")} placeholder="John Doe" />

        <div>
          <label className="block text-caption-strong text-ink-muted80 mb-1.5">Employee ID</label>
          <input disabled value="Employee ID will be auto-generated" className="w-full h-11 px-3.5 rounded-sm border border-hairline bg-canvas-parchment text-caption text-ink-muted48" />
        </div>

        <div>
          <TextField label="Employee Code" required value={form.employeeCode} error={errors.employeeCode} onChange={set("employeeCode")} placeholder="EMP001" />
          <p className="text-fine-print text-ink-muted48 mt-1">This ID will be used to map employee with biometric device.</p>
        </div>

        <TextField label="Email" type="email" required value={form.email} error={errors.email} onChange={set("email")} placeholder="john@example.com" />
        <TextField label="Password" type="password" required value={form.password} error={errors.password} onChange={set("password")} />
        <TextField label="Phone Number" required value={form.phone} error={errors.phone} onChange={set("phone")} placeholder="+1 234 567 8900" />
        <TextField label="Date of Birth" type="date" required value={form.dateOfBirth} error={errors.dateOfBirth} onChange={set("dateOfBirth")} />
        <SelectField label="Gender" required value={form.gender} error={errors.gender} onChange={set("gender")} options={[{ value: "", label: "Select gender" }, ...GENDER_OPTIONS]} />
      </div>

      <div>
        <label className="block text-caption-strong text-ink-muted80 mb-1.5">Profile Image <span className="text-danger">*</span></label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-canvas-parchment border border-hairline flex items-center justify-center overflow-hidden shrink-0">
            {photo ? <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-fine-print text-ink-muted48">No image</span>}
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
          />
        </div>
        <p className="text-fine-print text-ink-muted48 mt-1">Maximum 2MB.</p>
        {(form._photoError || errors.photo) && <p className="text-fine-print text-danger mt-1">{form._photoError || errors.photo}</p>}
      </div>
    </div>
  );
}
