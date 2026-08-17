import React, { useEffect, useRef, useState } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { attendanceService } from "../../services/attendanceService";
import { employeeService } from "../../services/employeeService";
import { departmentService } from "../../services/departmentService";
import { useToast } from "../../context/ToastContext";
import { SelectField } from "../common/FormField";
import Button from "../common/Button";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import { downloadBlob } from "../../utils/download";

const CELL_STYLES = {
  present: "bg-success-soft text-success",
  absent: "bg-danger-soft text-danger",
  half_day: "bg-warning-soft text-warning",
  on_leave: "bg-primary/10 text-primary",
  day_off: "bg-ink-muted48/10 text-ink-muted80",
  holiday: "bg-success-soft text-success",
  future: "bg-canvas-parchment text-ink-muted48/50",
  not_added: "bg-canvas-parchment text-ink-muted48",
};

const CELL_INITIALS = {
  present: "P",
  absent: "A",
  half_day: "H",
  on_leave: "L",
  day_off: "D",
  holiday: "H",
  future: "",
  not_added: "·",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendanceMatrix() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = { year, month, employee: employeeFilter || undefined, department: departmentFilter || undefined };
    Promise.all([attendanceService.matrix(params), attendanceService.summary(params)])
      .then(([matrixRes, summaryRes]) => {
        setMatrix(matrixRes.data.data);
        setSummary(summaryRes.data.data);
      })
      .catch(() => toast.error("Couldn't load attendance matrix"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [year, month, employeeFilter, departmentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await attendanceService.exportCSV({
        year,
        month,
        employee: employeeFilter || undefined,
        department: departmentFilter || undefined,
      });
      downloadBlob(data, `attendance-${year}-${String(month).padStart(2, "0")}.csv`);
    } catch {
      toast.error("Couldn't export attendance");
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const { data } = await attendanceService.importCSV(file);
      toast.success(`Imported ${data.data.created} record(s)${data.data.skipped ? `, skipped ${data.data.skipped}` : ""}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't import CSV");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: String(y), label: String(y) };
  });
  const monthOptions = MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-body-strong">Monthly Attendance Matrix</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport} loading={exporting}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={Upload} onClick={handleImportClick} loading={importing}>
            Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SelectField value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} options={monthOptions} className="w-full sm:w-40" />
        <SelectField value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} className="w-full sm:w-28" />
        <SelectField
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          options={[{ value: "", label: "All Employees" }, ...employees.map((emp) => ({ value: emp._id, label: emp.name }))]}
          className="w-full sm:w-52"
        />
        <SelectField
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
          className="w-full sm:w-48"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading attendance matrix…" />
      ) : !matrix || matrix.matrix.length === 0 ? (
        <EmptyState icon={FileSpreadsheet} title="No employees match these filters" />
      ) : (
        <div className="overflow-x-auto border border-hairline rounded-md">
          <table className="border-collapse text-fine-print">
            <thead>
              <tr>
                <th className="sticky left-0 bg-canvas-parchment text-left px-3 py-2 text-caption-strong border-b border-r border-hairline min-w-[160px]">
                  Employee
                </th>
                {matrix.matrix[0]?.days.map((d) => (
                  <th key={d.date} className="bg-canvas-parchment text-center px-1 py-2 border-b border-hairline w-7 font-medium text-ink-muted48">
                    {Number(d.date.split("-")[2])}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.matrix.map((row) => (
                <tr key={row.employee._id}>
                  <td className="sticky left-0 bg-canvas text-left px-3 py-1.5 border-r border-b border-hairline text-caption-strong whitespace-nowrap">
                    {row.employee.name}
                  </td>
                  {row.days.map((d) => (
                    <td key={d.date} className="border-b border-hairline p-0.5 text-center" title={`${d.date}: ${d.label}`}>
                      <div className={`w-6 h-6 mx-auto rounded-xs flex items-center justify-center text-[10px] font-semibold ${CELL_STYLES[d.status]}`}>
                        {CELL_INITIALS[d.status]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-fine-print text-ink-muted48">
        <span><span className="inline-block w-3 h-3 rounded-xs bg-success-soft align-middle mr-1" />Present / Holiday</span>
        <span><span className="inline-block w-3 h-3 rounded-xs bg-danger-soft align-middle mr-1" />Absent</span>
        <span><span className="inline-block w-3 h-3 rounded-xs bg-warning-soft align-middle mr-1" />Half Day</span>
        <span><span className="inline-block w-3 h-3 rounded-xs bg-primary/10 align-middle mr-1" />Leave</span>
        <span><span className="inline-block w-3 h-3 rounded-xs bg-ink-muted48/10 align-middle mr-1" />Day Off</span>
        <span><span className="inline-block w-3 h-3 rounded-xs bg-canvas-parchment align-middle mr-1" />Not Added / Future</span>
      </div>

      {summary && summary.length > 0 && (
        <div>
          <h3 className="text-body-strong mb-3">Monthly Summary — {MONTH_NAMES[month - 1]} {year}</h3>
          <div className="overflow-x-auto border border-hairline rounded-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas-parchment">
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline">Employee</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Present</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Absent</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Half Day</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Leave</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Day Off</th>
                  <th className="px-3 py-2 text-caption-strong border-b border-hairline text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.employee._id} className="border-b border-divider-soft last:border-0">
                    <td className="px-3 py-2 text-caption-strong">{row.employee.name}</td>
                    <td className="px-3 py-2 text-caption text-center">{row.present}</td>
                    <td className="px-3 py-2 text-caption text-center">{row.absent}</td>
                    <td className="px-3 py-2 text-caption text-center">{row.half_day}</td>
                    <td className="px-3 py-2 text-caption text-center">{row.on_leave}</td>
                    <td className="px-3 py-2 text-caption text-center">{row.day_off}</td>
                    <td className="px-3 py-2 text-caption-strong text-center">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
