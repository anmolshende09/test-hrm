import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { employeeService } from "../services/employeeService";
import { departmentService } from "../services/departmentService";
import { useToast } from "../context/ToastContext";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmployeeForm from "../components/employee/EmployeeForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, initials } from "../utils/format";

export default function Employees() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // lightweight list, for the "Reports To" dropdown
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(searchParams.get("action") === "add");
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadEmployees = useCallback(
    (page = 1) => {
      setLoading(true);
      employeeService
        .list({ search: debouncedSearch || undefined, page, limit: 10 })
        .then(({ data }) => {
          setEmployees(data.data);
          setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        })
        .catch(() => toast.error("Couldn't load employees"))
        .finally(() => setLoading(false));
    },
    [debouncedSearch] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const loadAllEmployees = useCallback(() => {
    employeeService.orgChart().then(({ data }) => setAllEmployees(data.data)).catch(() => {});
  }, []);

  useEffect(loadAllEmployees, [loadAllEmployees]);

  useEffect(() => {
    loadEmployees(1);
  }, [loadEmployees]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    if (searchParams.get("action")) setSearchParams({});
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await employeeService.update(editing._id, formData);
        toast.success("Employee updated");
      } else {
        await employeeService.create(formData);
        toast.success("Employee added");
      }
      closeModal();
      loadEmployees(pagination.page);
      loadAllEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.remove(deleteTarget._id);
      toast.success("Employee deleted");
      setDeleteTarget(null);
      loadEmployees(pagination.page);
      loadAllEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
            {initials(row.name)}
          </div>
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
    { key: "joiningDate", header: "Joined", render: (row) => formatDate(row.joiningDate) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"
          >
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
          <p className="text-caption text-ink-muted48 mt-1">Manage your organization's workforce.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Employee
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or ID…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={employees} loading={loading} emptyTitle="No employees found" emptyDescription="Try a different search, or add your first employee." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadEmployees} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Employee" : "Add Employee"} width="max-w-2xl">
        <EmployeeForm
          initialValues={editing}
          departments={departments}
          employees={allEmployees}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete employee?"
        description={`This will permanently remove ${deleteTarget?.name} from the system. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
