import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ClipboardEdit, CheckCircle2, RefreshCw, Eye } from "lucide-react";
import { employeeContractService } from "../services/employeeContractService";
import { employeeService } from "../services/employeeService";
import { contractTypeService } from "../services/contractTypeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField, TextField, TextAreaField } from "../components/common/FormField";
import EmployeeContractForm from "../components/employeeContract/EmployeeContractForm";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate, formatCurrency } from "../utils/format";


const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
];

export default function EmployeeContracts() {
  const toast = useToast();
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewEndDate, setRenewEndDate] = useState("");
  const [renewNote, setRenewNote] = useState("");
  const [renewing, setRenewing] = useState(false);

  const [detailsTarget, setDetailsTarget] = useState(null);
  const [amendmentText, setAmendmentText] = useState("");
  const [addingAmendment, setAddingAmendment] = useState(false);

  useEffect(() => {
    // NOTE: assumes employeeService.list follows the same { data: { data, pagination } }
    // convention as every other service in this project. Swap to an /all endpoint here
    // if employeeService exposes one, for a lighter dropdown fetch.
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
    contractTypeService.all().then(({ data }) => setContractTypes(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    employeeContractService
      .list({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setContracts(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load employee contracts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (contract) => {
    setEditing(contract);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await employeeContractService.update(editing._id, payload);
        toast.success("Contract updated");
      } else {
        await employeeContractService.create(payload);
        toast.success("Contract created");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (contract) => {
    setApprovingId(contract._id);
    try {
      await employeeContractService.approve(contract._id);
      toast.success("Contract approved and activated");
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't approve contract");
    } finally {
      setApprovingId(null);
    }
  };

  const openRenew = (contract) => {
    setRenewTarget(contract);
    setRenewEndDate("");
    setRenewNote("");
  };

  const handleRenew = async () => {
    if (!renewEndDate) {
      toast.error("Choose a new end date");
      return;
    }
    setRenewing(true);
    try {
      await employeeContractService.renew(renewTarget._id, { newEndDate: renewEndDate, note: renewNote || undefined });
      toast.success("Contract renewed");
      setRenewTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't renew contract");
    } finally {
      setRenewing(false);
    }
  };

  const openDetails = async (contract) => {
    try {
      const { data } = await employeeContractService.get(contract._id);
      setDetailsTarget(data.data);
    } catch {
      toast.error("Couldn't load contract details");
    }
  };

  const handleAddAmendment = async () => {
    if (!amendmentText) return;
    setAddingAmendment(true);
    try {
      const { data } = await employeeContractService.addAmendment(detailsTarget._id, { description: amendmentText });
      setDetailsTarget(data.data);
      setAmendmentText("");
      toast.success("Amendment recorded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add amendment");
    } finally {
      setAddingAmendment(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeContractService.remove(deleteTarget._id);
      toast.success("Contract deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete contract");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "contractNumber",
      header: "Contract",
      render: (row) => (
        <button onClick={() => openDetails(row)} className="flex items-center gap-3 text-left hover:underline">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardEdit size={16} />
          </div>
          <div>
            <span className="text-caption-strong block">{row.contractNumber}</span>
            <span className="text-fine-print text-ink-muted48">{row.contractType?.name}</span>
          </div>
        </button>
      ),
    },
    {
      key: "employee",
      header: "Employee",
      render: (row) => row.employee?.name || "—",
    },
    {
      key: "period",
      header: "Period",
      render: (row) => (
        <span className="text-caption text-ink-muted80">
          {formatDate(row.startDate)} – {row.endDate ? formatDate(row.endDate) : "No end date"}
          {row.daysUntilExpiry != null && row.daysUntilExpiry >= 0 && row.status === "active" && (
            <span className="block text-fine-print text-ink-muted48">{row.daysUntilExpiry} days left</span>
          )}
        </span>
      ),
    },
    {
      key: "basicSalary",
      header: "Salary",
      render: (row) => (row.basicSalary != null ? formatCurrency(row.basicSalary) : "—"),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === "draft" && (
            <button
              onClick={() => handleApprove(row)}
              disabled={approvingId === row._id}
              aria-label={`Approve ${row.contractNumber}`}
              className="press-active w-8 h-8 rounded-full hover:bg-success-soft flex items-center justify-center text-ink-muted48 hover:text-success"
            >
              <CheckCircle2 size={15} />
            </button>
          )}
          {(row.status === "active" || row.status === "expired") && row.contractType?.isRenewable && (
            <button
              onClick={() => openRenew(row)}
              aria-label={`Renew ${row.contractNumber}`}
              className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <button
            onClick={() => openDetails(row)}
            aria-label={`View ${row.contractNumber}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.contractNumber}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete ${row.contractNumber}`}
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
          <h1 className="text-display-md">Employee Contracts</h1>
          <p className="text-caption text-ink-muted48 mt-1">Create and manage individual employment agreements.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Contract
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by contract number…" className="max-w-sm" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_FILTER_OPTIONS} className="w-full sm:w-44" />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={contracts}
          loading={loading}
          emptyTitle="No employee contracts yet"
          emptyDescription="Create your first employment contract."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Contract" : "Add Contract"} width="max-w-2xl">
        <EmployeeContractForm
          initialValues={editing}
          employees={employees}
          contractTypes={contractTypes}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!renewTarget} onClose={() => setRenewTarget(null)} title={`Renew ${renewTarget?.contractNumber || ""}`}>
        <div className="space-y-4">
          <TextField label="New End Date" type="date" required value={renewEndDate} onChange={(e) => setRenewEndDate(e.target.value)} />
          <TextAreaField label="Note (optional)" rows={3} value={renewNote} onChange={(e) => setRenewNote(e.target.value)} placeholder="Reason for renewal, changed terms, etc." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setRenewTarget(null)} disabled={renewing}>
              Cancel
            </Button>
            <Button onClick={handleRenew} loading={renewing}>
              Renew Contract
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailsTarget} onClose={() => setDetailsTarget(null)} title={detailsTarget?.contractNumber || "Contract Details"} width="max-w-2xl">
        {detailsTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-caption">
              <div>
                <span className="text-ink-muted48 block">Employee</span>
                <span className="text-caption-strong">{detailsTarget.employee?.name}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Contract Type</span>
                <span className="text-caption-strong">{detailsTarget.contractType?.name}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Period</span>
                <span className="text-caption-strong">
                  {formatDate(detailsTarget.startDate)} – {detailsTarget.endDate ? formatDate(detailsTarget.endDate) : "No end date"}
                </span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Status</span>
                <StatusBadge status={detailsTarget.status} />
              </div>
            </div>

            {detailsTarget.allowances?.length > 0 && (
              <div>
                <p className="text-caption-strong text-ink-muted80 mb-1">Allowances</p>
                <ul className="text-caption text-ink-muted80 space-y-0.5">
                  {detailsTarget.allowances.map((a, i) => (
                    <li key={i}>{a.name}: {formatCurrency(a.amount)}</li>
                  ))}
                </ul>
              </div>
            )}

            {detailsTarget.benefits?.length > 0 && (
              <div>
                <p className="text-caption-strong text-ink-muted80 mb-1">Benefits</p>
                <ul className="text-caption text-ink-muted80 list-disc list-inside">
                  {detailsTarget.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {detailsTarget.termsAndConditions && (
              <div>
                <p className="text-caption-strong text-ink-muted80 mb-1">Terms & Conditions</p>
                <p className="text-caption text-ink-muted80 whitespace-pre-wrap">{detailsTarget.termsAndConditions}</p>
              </div>
            )}

            <div>
              <p className="text-caption-strong text-ink-muted80 mb-1">Amendment History</p>
              {(!detailsTarget.amendments || detailsTarget.amendments.length === 0) && (
                <p className="text-fine-print text-ink-muted48">No amendments recorded yet.</p>
              )}
              <ul className="space-y-2">
                {(detailsTarget.amendments || [])
                  .slice()
                  .reverse()
                  .map((a, i) => (
                    <li key={i} className="text-caption border-l-2 border-hairline pl-3">
                      <p className="text-ink-muted80">{a.description}</p>
                      <p className="text-fine-print text-ink-muted48">
                        {a.amendedBy?.name || "Unknown"} • {formatDate(a.amendedAt)}
                      </p>
                    </li>
                  ))}
              </ul>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add an amendment note…"
                  value={amendmentText}
                  onChange={(e) => setAmendmentText(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
                />
                <Button type="button" onClick={handleAddAmendment} loading={addingAmendment} disabled={!amendmentText}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete contract?"
        description={`This will permanently remove contract "${deleteTarget?.contractNumber}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}