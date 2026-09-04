import React, { useEffect, useState } from "react";
import { TextField, SelectField } from "../../common/FormField";
import { designationService } from "../../../services/designationService";
import { EMPLOYMENT_TYPE_OPTIONS, EMPLOYEE_STATUS_OPTIONS } from "../../../constants/options";

export default function StepEmployment({ form, setForm, errors, branches, departments, shifts, attendancePolicies }) {
  const [designationOptions, setDesignationOptions] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  const filteredDepartments = form.branch ? departments.filter((d) => (d.branch?._id || d.branch) === form.branch) : [];

  useEffect(() => {
    if (!form.department) {
      setDesignationOptions([]);
      return;
    }
    setLoadingDesignations(true);
    designationService
      .all(form.department)
      .then(({ data }) => setDesignationOptions(data.data))
      .catch(() => setDesignationOptions([]))
      .finally(() => setLoadingDesignations(false));
  }, [form.department]);

  const handleBranchChange = (e) => {
    // Branch changed -> reset Department and Designation, per §17.
    setForm({ ...form, branch: e.target.value, department: "", designation: "" });
  };
  const handleDepartmentChange = (e) => {
    // Department changed -> reset Designation.
    setForm({ ...form, department: e.target.value, designation: "" });
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <h2 className="text-body-strong">Employment Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Branch"
          required
          value={form.branch}
          error={errors.branch}
          onChange={handleBranchChange}
          options={[{ value: "", label: "Select branch" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
        />
        <SelectField
          label="Department"
          required
          value={form.department}
          error={errors.department}
          onChange={handleDepartmentChange}
          disabled={!form.branch}
          options={[
            { value: "", label: form.branch ? "Select department" : "Select Branch First" },
            ...filteredDepartments.map((d) => ({ value: d._id, label: d.name })),
          ]}
        />
        <SelectField
          label="Designation"
          required
          value={form.designation}
          error={errors.designation}
          onChange={set("designation")}
          disabled={!form.department || loadingDesignations}
          options={[
            { value: "", label: !form.department ? "Select Department First" : loadingDesignations ? "Loading…" : "Select designation" },
            ...designationOptions.map((d) => ({ value: d._id, label: d.name })),
          ]}
        />
        <TextField label="Date of Joining" type="date" required value={form.joiningDate} error={errors.joiningDate} onChange={set("joiningDate")} />
        <SelectField label="Employment Type" required value={form.employmentType} error={errors.employmentType} onChange={set("employmentType")} options={EMPLOYMENT_TYPE_OPTIONS} />
        <SelectField label="Employee Status" required value={form.status} error={errors.status} onChange={set("status")} options={EMPLOYEE_STATUS_OPTIONS} />
        <SelectField
          label="Shift (Optional)"
          value={form.shift}
          onChange={set("shift")}
          options={[{ value: "", label: "No shift assigned" }, ...shifts.map((s) => ({ value: s._id, label: `${s.name} (${s.startTime}–${s.endTime})` }))]}
        />
        <SelectField
          label="Attendance Policy (Optional)"
          value={form.attendancePolicy}
          onChange={set("attendancePolicy")}
          options={[{ value: "", label: "No policy assigned" }, ...attendancePolicies.map((p) => ({ value: p._id, label: p.name }))]}
        />
      </div>
    </div>
  );
}
