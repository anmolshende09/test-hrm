import React, { useState } from "react";
import { SelectField, TextField } from "../common/FormField";
import Button from "../common/Button";
import { toInputDate } from "../../utils/format";

export default function BulkAssignTrainingForm({ employees, trainingPrograms, onSubmit, onCancel, submitting }) {
  const [trainingProgram, setTrainingProgram] = useState("");
  const [assignedDate, setAssignedDate] = useState(toInputDate(new Date()));
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const programOptions = [
    { value: "", label: "Select Training Program" },
    ...trainingPrograms.map((p) => ({ value: p._id, label: p.name })),
  ];

  const toggleEmployee = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!trainingProgram || !assignedDate) {
      setError("Training program and assigned date are required");
      return;
    }
    if (selected.length === 0) {
      setError("Select at least one employee");
      return;
    }
    setError("");
    onSubmit({ employees: selected, trainingProgram, assignedDate });
  };

  return (
    <div className="space-y-4">
      <SelectField label="Training Program" required value={trainingProgram} onChange={(e) => setTrainingProgram(e.target.value)} options={programOptions} />
      <TextField label="Assigned Date" type="date" required value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />

      <div>
        <label className="block text-caption-strong text-ink-muted80 mb-1.5">
          Employees <span className="text-fine-print text-ink-muted48">({selected.length} selected)</span>
        </label>
        <div className="border border-hairline rounded-sm max-h-60 overflow-y-auto divide-y divide-hairline">
          {employees.length === 0 && <p className="p-3 text-caption text-ink-muted48">No employees found.</p>}
          {employees.map((emp) => (
            <label key={emp._id} className="flex items-center gap-2.5 px-3 py-2 text-caption cursor-pointer hover:bg-canvas-parchment">
              <input
                type="checkbox"
                checked={selected.includes(emp._id)}
                onChange={() => toggleEmployee(emp._id)}
                className="w-4 h-4 rounded-xs border-hairline text-primary focus:ring-primary-focus"
              />
              {emp.name} <span className="text-ink-muted48">({emp.employeeId})</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-fine-print text-danger">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={selected.length === 0}>
          Save
        </Button>
      </div>
    </div>
  );
}
