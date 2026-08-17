import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../common/FormField";
import Button from "../common/Button";
import { EMPLOYEE_STATUS } from "../../constants/options";
import { toInputDate } from "../../utils/format";
import { designationService } from "../../services/designationService";
import { shiftService } from "../../services/shiftService";

const STATUS_OPTIONS = Object.values(EMPLOYEE_STATUS).map((s) => ({
  value: s,
  label: s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  salary: "",
  status: "active",
  manager: "",
  shift: "",
};

export default function EmployeeForm({ initialValues, departments, employees = [], onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);

  useEffect(() => {
    shiftService.all().then(({ data }) => setShiftOptions(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        employeeId: initialValues.employeeId || "",
        name: initialValues.name || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        department: initialValues.department?._id || initialValues.department || "",
        designation: initialValues.designation?._id || initialValues.designation || "",
        joiningDate: toInputDate(initialValues.joiningDate),
        salary: initialValues.salary ?? "",
        status: initialValues.status || "active",
        manager: initialValues.manager?._id || initialValues.manager || "",
        shift: initialValues.shift?._id || initialValues.shift || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  // Designation is scoped to the selected department — refetch whenever it
  // changes, and if the currently-selected designation doesn't belong to the
  // new department, clear it rather than silently submit a mismatched pair.
  useEffect(() => {
    if (!form.department) {
      setDesignationOptions([]);
      return;
    }
    setLoadingDesignations(true);
    designationService
      .all(form.department)
      .then(({ data }) => {
        setDesignationOptions(data.data);
        setForm((prev) => {
          const stillValid = data.data.some((d) => d._id === prev.designation);
          return stillValid ? prev : { ...prev, designation: "" };
        });
      })
      .catch(() => setDesignationOptions([]))
      .finally(() => setLoadingDesignations(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.department]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.employeeId) next.employeeId = "Employee ID is required";
    if (!form.name) next.name = "Name is required";
    if (!form.email) next.email = "Email is required";
    if (!form.department) next.department = "Department is required";
    if (!form.designation) next.designation = "Designation is required";
    if (!form.joiningDate) next.joiningDate = "Joining date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // "manager"/"shift" are always sent, even empty — the backend treats an
      // empty value as "clear this field", so omitting it would silently
      // prevent ever un-assigning a manager or shift once set.
      if (key === "manager" || key === "shift" || (value !== "" && value !== null && value !== undefined)) {
        formData.append(key, value);
      }
    });
    if (photo) formData.append("profilePicture", photo);

    onSubmit(formData);
  };

  // Can't report to yourself. Full cycle prevention is a backend concern.
  const managerOptions = [
    { value: "", label: "No manager" },
    ...employees
      .filter((e) => e._id !== initialValues?._id)
      .map((e) => ({ value: e._id, label: `${e.name} (${e.designation || "—"})` })),
  ];

  const shiftSelectOptions = [
    { value: "", label: "No shift assigned" },
    ...shiftOptions.map((s) => ({ value: s._id, label: `${s.name} (${s.startTime}–${s.endTime})` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Employee ID" required value={form.employeeId} error={errors.employeeId} onChange={set("employeeId")} />
        <TextField label="Full Name" required value={form.name} error={errors.name} onChange={set("name")} />
        <TextField label="Email" type="email" required value={form.email} error={errors.email} onChange={set("email")} />
        <TextField label="Phone" value={form.phone} onChange={set("phone")} />
        <SelectField
          label="Department"
          required
          placeholder="Select department"
          value={form.department}
          error={errors.department}
          onChange={set("department")}
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
        />
        <SelectField
          label="Designation"
          required
          placeholder={!form.department ? "Select department first" : loadingDesignations ? "Loading…" : "Select designation"}
          value={form.designation}
          error={errors.designation}
          onChange={set("designation")}
          disabled={!form.department || loadingDesignations}
          options={designationOptions.map((d) => ({ value: d._id, label: d.name }))}
        />
        <TextField label="Joining Date" type="date" required value={form.joiningDate} error={errors.joiningDate} onChange={set("joiningDate")} />
        <TextField label="Salary (optional)" type="number" value={form.salary} onChange={set("salary")} />
        <SelectField label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
        <SelectField label="Reports To (optional)" value={form.manager} onChange={set("manager")} options={managerOptions} />
        <SelectField label="Shift (optional)" value={form.shift} onChange={set("shift")} options={shiftSelectOptions} />
        <div>
          <label className="block text-caption-strong text-ink-muted80 mb-1.5">Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}
