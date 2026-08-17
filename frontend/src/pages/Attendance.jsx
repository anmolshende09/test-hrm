import React, { useEffect, useState } from "react";
import { UserCheck, UserX, Clock, CalendarClock } from "lucide-react";
import { attendanceService } from "../services/attendanceService";
import { employeeService } from "../services/employeeService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import { ATTENDANCE_STATUS } from "../constants/options";
import StatCard from "../components/common/StatCard";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { SelectField } from "../components/common/FormField";
import Button from "../components/common/Button";
import AttendanceMatrix from "../components/attendance/AttendanceMatrix";
import { formatDate, initials } from "../utils/format";

const STATUS_OPTIONS = [
  { value: ATTENDANCE_STATUS.PRESENT, label: "Present" },
  { value: ATTENDANCE_STATUS.ABSENT, label: "Absent" },
  { value: ATTENDANCE_STATUS.HALF_DAY, label: "Half Day" },
  { value: ATTENDANCE_STATUS.ON_LEAVE, label: "On Leave" },
  { value: ATTENDANCE_STATUS.DAY_OFF, label: "Day Off" },
];

function ManagerAttendanceView() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(ATTENDANCE_STATUS.PRESENT);
  const [marking, setMarking] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([attendanceService.today(), employeeService.list({ limit: 100 })])
      .then(([todayRes, empRes]) => {
        setSummary(todayRes.data.data);
        setEmployees(empRes.data.data);
      })
      .catch(() => toast.error("Couldn't load attendance data"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMark = async () => {
    if (!selectedEmployee) {
      toast.error("Select an employee first");
      return;
    }
    setMarking(true);
    try {
      await attendanceService.mark({ employee: selectedEmployee, status: selectedStatus });
      toast.success("Attendance marked");
      setSelectedEmployee("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't mark attendance");
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading attendance…" />;

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-fine-print font-semibold shrink-0">
            {initials(row.employee?.name)}
          </div>
          <span className="text-caption-strong">{row.employee?.name || "Unknown"}</span>
        </div>
      ),
    },
    { key: "employeeId", header: "ID", render: (row) => row.employee?.employeeId || "—" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" count={summary.totalEmployees} icon={UserCheck} theme="blue" />
        <StatCard title="Present" count={summary.present} icon={UserCheck} theme="green" />
        <StatCard title="Absent" count={summary.absent} icon={UserX} theme="red" />
        <StatCard title="Unmarked" count={summary.unmarked} icon={Clock} theme="amber" />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <h3 className="text-body-strong mb-4">Mark Attendance</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <SelectField
            label="Employee"
            placeholder="Select employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId})` }))}
            className="flex-1"
          />
          <SelectField
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={STATUS_OPTIONS}
            className="w-full sm:w-44"
          />
          <Button onClick={handleMark} loading={marking} className="sm:mb-0">
            Mark
          </Button>
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <h3 className="text-body-strong mb-4">Today's Attendance — {formatDate(summary.date)}</h3>
        <Table columns={columns} data={summary.records} emptyTitle="No attendance marked yet today" />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <AttendanceMatrix />
      </div>
    </div>
  );
}

function EmployeeAttendanceView() {
  const { user } = useAuth();
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [percentage, setPercentage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employeeId = user?.employee?._id || user?.employee;
    if (!employeeId) {
      setLoading(false);
      return;
    }
    Promise.all([attendanceService.history(employeeId), attendanceService.percentage(employeeId)])
      .then(([histRes, pctRes]) => {
        setHistory(histRes.data.data);
        setPercentage(pctRes.data.data);
      })
      .catch(() => toast.error("Couldn't load your attendance"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading your attendance…" />;

  const columns = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "remarks", header: "Remarks", render: (row) => row.remarks || "—" },
  ];

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Attendance Rate" count={`${percentage?.percentage ?? 0}%`} icon={CalendarClock} theme="blue" />
        <StatCard title="Days Present" count={percentage?.presentDays ?? 0} icon={UserCheck} theme="green" />
        <StatCard title="Total Recorded Days" count={percentage?.totalDays ?? 0} icon={Clock} theme="amber" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <h3 className="text-body-strong mb-4">Attendance History</h3>
        <Table columns={columns} data={history} emptyTitle="No attendance records yet" />
      </div>
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-display-md">Attendance</h1>
        <p className="text-caption text-ink-muted48 mt-1">
          {canManage ? "Track and mark attendance across the organization." : "View your attendance record."}
        </p>
      </div>
      {canManage ? <ManagerAttendanceView /> : <EmployeeAttendanceView />}
    </div>
  );
}
