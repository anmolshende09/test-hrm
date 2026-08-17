import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { warningService } from "../services/warningService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import {
  SelectField,
  TextField,
  TextAreaField,
} from "../components/common/FormField";
import { formatDate, titleCase } from "../utils/format";

const TYPE_OPTIONS = [
  { value: "verbal", label: "Verbal" },
  { value: "written", label: "Written" },
  { value: "final_notice", label: "Final Notice" },
];

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
];

const emptyForm = {
  employee: "",
  subject: "",
  warningType: "written",
  severity: "medium",
  status: "active",
  improvementPlan: "",
};

export default function Warnings() {
  const toast = useToast();

  const [warnings, setWarnings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warningToDelete, setWarningToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    employeeService
      .list({ limit: 200 })
      .then(({ data }) => setEmployees(data.data))
      .catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);

    warningService
      .list({
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setWarnings(data.data);

        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
        });
      })
      .catch(() => toast.error("Couldn't load warnings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [statusFilter]); // eslint-disable-line

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setEditing(w);

    setForm({
      employee: w.employee?._id || "",
      subject: w.subject,
      warningType: w.warningType,
      severity: w.severity,
      status: w.status,
      improvementPlan: w.improvementPlan || "",
    });

    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // Open delete confirmation
  const openDeleteDialog = (warning) => {
    setWarningToDelete(warning);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation
  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setWarningToDelete(null);
  };

  // Delete warning
  const handleDelete = async () => {
    if (!warningToDelete) return;

    setDeleting(true);

    try {
      await warningService.remove(warningToDelete._id);

      toast.success("Warning deleted");

      setDeleteDialogOpen(false);
      setWarningToDelete(null);

      // Reload current page
      load(pagination.page);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't delete warning"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = {};

    if (!form.employee) {
      next.employee = "Employee is required";
    }

    if (!form.subject) {
      next.subject = "Subject is required";
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    setSubmitting(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      if (editing) {
        await warningService.update(editing._id, fd);
        toast.success("Warning updated");
      } else {
        await warningService.create(fd);
        toast.success("Warning issued");
      }

      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const severityColor = {
    low: "text-success",
    medium: "text-warning",
    high: "text-danger",
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (r) => r.employee?.name || "—",
    },
    {
      key: "subject",
      header: "Subject",
    },
    {
      key: "warningType",
      header: "Type",
      render: (r) => titleCase(r.warningType),
    },
    {
      key: "severity",
      header: "Severity",
      render: (r) => (
        <span
          className={`text-caption-strong ${severityColor[r.severity]}`}
        >
          {titleCase(r.severity)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => formatDate(r.date),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {/* Edit */}
          <button
            onClick={() => openEdit(r)}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
            title="Edit warning"
          >
            <Pencil size={15} />
          </button>

          {/* Delete */}
          <button
            onClick={() => openDeleteDialog(r)}
            className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-danger"
            title="Delete warning"
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
          <h1 className="text-display-md">Warnings</h1>

          <p className="text-caption text-ink-muted48 mt-1">
            Disciplinary records — can be deleted by authorized HR users.
          </p>
        </div>

        <Button icon={Plus} onClick={openAdd}>
          Issue Warning
        </Button>
      </div>

      <SelectField
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        options={[
          { value: "", label: "All Statuses" },
          ...STATUS_OPTIONS,
        ]}
        className="w-full sm:w-44"
      />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={warnings}
          loading={loading}
          emptyTitle="No warnings issued"
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={load}
        />
      </div>

      {/* Add / Edit Warning Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Warning" : "Issue Warning"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            label="Employee"
            required
            placeholder="Select employee"
            value={form.employee}
            error={errors.employee}
            onChange={(e) =>
              setForm({
                ...form,
                employee: e.target.value,
              })
            }
            options={employees.map((e) => ({
              value: e._id,
              label: e.name,
            }))}
            disabled={!!editing}
          />

          <TextField
            label="Subject"
            required
            value={form.subject}
            error={errors.subject}
            onChange={(e) =>
              setForm({
                ...form,
                subject: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Warning Type"
              value={form.warningType}
              onChange={(e) =>
                setForm({
                  ...form,
                  warningType: e.target.value,
                })
              }
              options={TYPE_OPTIONS}
            />

            <SelectField
              label="Severity"
              value={form.severity}
              onChange={(e) =>
                setForm({
                  ...form,
                  severity: e.target.value,
                })
              }
              options={SEVERITY_OPTIONS}
            />
          </div>

          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
            options={STATUS_OPTIONS}
          />

          <TextAreaField
            label="Improvement Plan (optional)"
            value={form.improvementPlan}
            onChange={(e) =>
              setForm({
                ...form,
                improvementPlan: e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Issue warning"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Warning?"
        description={
          warningToDelete
            ? `Are you sure you want to delete the warning "${warningToDelete.subject}" issued to ${warningToDelete.employee?.name || "this employee"}? This action cannot be undone.`
            : "Are you sure you want to delete this warning? This action cannot be undone."
        }
        confirmLabel="Delete Warning"
        loading={deleting}
        danger
      />
    </div>
  );
}