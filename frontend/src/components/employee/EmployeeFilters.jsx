import React, { useEffect, useState } from "react";
import { designationService } from "../../services/designationService";
import { SelectField } from "../common/FormField";
import Button from "../common/Button";
import { EMPLOYEE_STATUS_OPTIONS } from "../../constants/options";

export default function EmployeeFilters({ open, onClose, branches, departments, value, onApply, onReset }) {
  const [draft, setDraft] = useState(value);
  const [designationOptions, setDesignationOptions] = useState([]);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const filteredDepartments = draft.branch ? departments.filter((d) => (d.branch?._id || d.branch) === draft.branch) : departments;

  useEffect(() => {
    if (!draft.department) {
      setDesignationOptions([]);
      return;
    }
    designationService.all(draft.department).then(({ data }) => setDesignationOptions(data.data)).catch(() => setDesignationOptions([]));
  }, [draft.department]);

  const handleBranchChange = (e) => {
    setDraft({ ...draft, branch: e.target.value, department: "", designation: "" });
  };
  const handleDepartmentChange = (e) => {
    setDraft({ ...draft, department: e.target.value, designation: "" });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const cleared = { branch: "", department: "", designation: "", status: "" };
    setDraft(cleared);
    onReset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectField
          label="Branch"
          value={draft.branch}
          onChange={handleBranchChange}
          options={[{ value: "", label: "All Branches" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
        />
        <SelectField
          label="Department"
          value={draft.department}
          onChange={handleDepartmentChange}
          options={[{ value: "", label: "All Departments" }, ...filteredDepartments.map((d) => ({ value: d._id, label: d.name }))]}
        />
        <SelectField
          label="Designation"
          value={draft.designation}
          onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
          disabled={!draft.department}
          options={[
            { value: "", label: draft.department ? "All Designations" : "Select department first" },
            ...designationOptions.map((d) => ({ value: d._id, label: d.name })),
          ]}
        />
        <SelectField
          label="Status"
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value })}
          options={[{ value: "", label: "All Statuses" }, ...EMPLOYEE_STATUS_OPTIONS]}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
        <Button type="button" variant="ghost" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button type="button" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
