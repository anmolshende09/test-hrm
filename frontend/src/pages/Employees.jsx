import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Download, Upload, SlidersHorizontal, LayoutGrid, List, Eye, Pencil, Key, Lock, Unlock, Trash2 } from "lucide-react";
import { employeeService } from "../services/employeeService";
import { branchService } from "../services/branchService";
import { departmentService } from "../services/departmentService";
import { useToast } from "../context/ToastContext";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmployeeFilters from "../components/employee/EmployeeFilters";
import EmployeeGridCard from "../components/employee/EmployeeGridCard";
import ChangePasswordModal from "../components/employee/ChangePasswordModal";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, initials } from "../utils/format";
import { EMPLOYEE_STATUS_TABS } from "../constants/options";

const emptyFilters = { branch: "", department: "", designation: "", status: "" };

export default function Employees() {
  const toast = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState({ all: 0, active: 0, inactive: 0, probation: 0, terminated: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [filters, setFilters] = useState(emptyFilters);
  const [statusTab, setStatusTab] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("list");

  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const activeParams = {
    search: debouncedSearch || undefined,
    branch: filters.branch || undefined,
    department: filters.department || undefined,
    designation: filters.designation || undefined,
    status: statusTab || undefined,
  };

  const loadCounts = useCallback(() => {
    employeeService
      .statusCounts({
        search: debouncedSearch || undefined,
        branch: filters.branch || undefined,
        department: filters.department || undefined,
        designation: filters.designation || undefined,
      })
      .then(({ data }) => setStatusCounts(data.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters]);

  const loadEmployees = useCallback(
    (page = 1) => {
      setLoading(true);
      employeeService
        .list({ ...activeParams, page, limit: 10 })
        .then(({ data }) => {
          setEmployees(data.data);
          setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        })
        .catch(() => toast.error("Couldn't load employees"))
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filters, statusTab]
  );

  useEffect(() => {
    loadEmployees(1);
    loadCounts();
  }, [loadEmployees, loadCounts]);

  const handleApplyFilters = (next) => setFilters(next);
  const handleResetFilters = () => setFilters(emptyFilters);

  const handleChangePassword = async (newPassword) => {
    setPasswordSubmitting(true);
    try {
      await employeeService.changePassword(passwordTarget._id, newPassword);
      toast.success("Password updated");
      setPasswordTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleToggleLoginStatus = async (employee) => {
    setStatusUpdatingId(employee._id);
    try {
      await employeeService.toggleLoginStatus(employee._id);
      toast.success(employee.loginActive === false ? "Login activated" : "Login deactivated");
      loadEmployees(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update login status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.remove(deleteTarget._id);
      toast.success("Employee deleted");
      setDeleteTarget(null);
      loadEmployees(pagination.page);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await employeeService.exportCSV(activeParams);
      const url = window.URL.createObjectURL(new Blob([data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `employees-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't export employees");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const { data } = await employeeService.importCSV(formData);
      toast.success(`${data.data.created} imported, ${data.data.skipped} skipped`);
      setImportOpen(false);
      setImportFile(null);
      loadEmployees(1);
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    {
      key: "index",
      header: "#",
      render: (row) => <span className="text-caption text-ink-muted48">{(pagination.page - 1) * 10 + employees.indexOf(row) + 1}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.profilePicture ? (
            <img src={row.profilePicture} alt={row.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
              {initials(row.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-caption-strong truncate">{row.name}</p>
            <p className="text-fine-print text-ink-muted48 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "employeeId", header: "ID" },
    { key: "department", header: "Department", render: (row) => row.department?.name || "—" },
    { key: "designation", header: "Designation", render: (row) => row.designation?.name || "—" },
    { key: "status", header: "Employee Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "joiningDate", header: "Joined", render: (row) => formatDate(row.joiningDate) },
    {
      key: "loginActive",
      header: "Login Status",
      render: (row) => (
        <span
          className={`text-fine-print px-2 py-0.5 rounded-pill ${
            row.loginActive === false ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
          }`}
        >
          {row.loginActive === false ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link to={`/employees/${row._id}`} title="View" className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Eye size={15} />
          </Link>
          <Link to={`/employees/${row._id}?edit=1`} title="Edit" className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Pencil size={15} />
          </Link>
          <button onClick={() => setPasswordTarget(row)} title="Change Password" className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
            <Key size={15} />
          </button>
          <button
            onClick={() => handleToggleLoginStatus(row)}
            disabled={statusUpdatingId === row._id}
            title={row.loginActive === false ? "Activate Login" : "Deactivate Login"}
            className={`press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center ${
              row.loginActive === false ? "text-warning" : "text-ink-muted48"
            }`}
          >
            {row.loginActive === false ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
          <button onClick={() => setDeleteTarget(row)} title="Delete" className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Employees</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage employees and their information.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={Download} onClick={handleExport} disabled={exporting}>
            Export
          </Button>
          <Button variant="ghost" icon={Upload} onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button icon={Plus} onClick={() => navigate("/employees/new")}>
            Add Employee
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or ID…" className="max-w-sm" />
        <Button variant="ghost" icon={SlidersHorizontal} onClick={() => setFiltersOpen((v) => !v)}>
          Filters
        </Button>
        <div className="flex items-center rounded-sm border border-hairline overflow-hidden shrink-0 ml-auto">
          <button onClick={() => setView("list")} title="List view" className={`w-9 h-9 flex items-center justify-center ${view === "list" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}>
            <List size={15} />
          </button>
          <button onClick={() => setView("grid")} title="Grid view" className={`w-9 h-9 flex items-center justify-center ${view === "grid" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}>
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      <EmployeeFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        branches={branches}
        departments={departments}
        value={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="flex flex-wrap items-center gap-2">
        {EMPLOYEE_STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`px-3.5 py-1.5 rounded-pill text-caption-strong transition-colors ${
              statusTab === tab.value ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"
            }`}
          >
            {tab.label} <span className="opacity-70">{statusCounts[tab.value || "all"] ?? 0}</span>
          </button>
        ))}
      </div>

      {view === "list" ? (
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <Table columns={columns} data={employees} loading={loading} emptyTitle="No employees found" emptyDescription="Try different filters, or add your first employee." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadEmployees} />
        </div>
      ) : loading ? (
        <LoadingSpinner label="Loading employees…" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <EmployeeGridCard
                key={emp._id}
                employee={emp}
                onChangePassword={setPasswordTarget}
                onToggleLoginStatus={handleToggleLoginStatus}
                onDelete={setDeleteTarget}
                statusUpdating={statusUpdatingId === emp._id}
              />
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadEmployees} />
        </>
      )}

      <Modal open={!!passwordTarget} onClose={() => setPasswordTarget(null)} title="Change Password">
        {passwordTarget && (
          <ChangePasswordModal employee={passwordTarget} onSubmit={handleChangePassword} onCancel={() => setPasswordTarget(null)} submitting={passwordSubmitting} />
        )}
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Employees">
        <div className="space-y-4">
          <p className="text-caption text-ink-muted48">
            CSV columns: Name, Email, Employee Code, Department, Designation, Joining Date (required), plus optional Phone, Employment Type, Status, Salary. Imported employees don't get a login account — add one later via Edit if needed.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setImportOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} loading={importing} disabled={!importFile}>
              Import
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete employee?"
        description={`This will permanently remove ${deleteTarget?.name}, their login account, and all uploaded documents. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
