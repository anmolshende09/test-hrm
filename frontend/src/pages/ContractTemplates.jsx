import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileCheck2, Star, Sparkles } from "lucide-react";
import { contractTemplateService } from "../services/contractTemplateService";
import { contractTypeService } from "../services/contractTypeService";
import { employeeService } from "../services/employeeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField, SelectField } from "../components/common/FormField";
import ContractTemplateForm from "../components/contractTemplate/ContractTemplateForm";
import { useDebounce } from "../hooks/useDebounce";
import { toInputDate } from "../utils/format";

export default function ContractTemplates() {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [generateTarget, setGenerateTarget] = useState(null);
  const [generateForm, setGenerateForm] = useState({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    contractTypeService.all().then(({ data }) => setContractTypes(data.data)).catch(() => {});
    employeeService.list({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    contractTemplateService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setTemplates(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load contract templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (template) => {
    setEditing(template);
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
        await contractTemplateService.update(editing._id, payload);
        toast.success("Template updated");
      } else {
        await contractTemplateService.create(payload);
        toast.success("Template created");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const openGenerate = (template) => {
    setGenerateTarget(template);
    const values = {};
    (template.variables || []).forEach((v) => (values[v] = ""));
    setGenerateForm({
      employee: "",
      contractNumber: "",
      startDate: toInputDate(new Date()),
      endDate: "",
      basicSalary: "",
      values,
    });
  };

  const handleGenerate = async () => {
    if (!generateForm.employee || !generateForm.contractNumber || !generateForm.startDate) {
      toast.error("Employee, contract number, and start date are required");
      return;
    }
    setGenerating(true);
    try {
      await contractTemplateService.generate(generateTarget._id, {
        employee: generateForm.employee,
        contractNumber: generateForm.contractNumber,
        startDate: generateForm.startDate,
        endDate: generateForm.endDate || undefined,
        basicSalary: generateForm.basicSalary === "" ? undefined : Number(generateForm.basicSalary),
        values: generateForm.values,
      });
      toast.success("Contract generated — check Employee Contracts as a draft");
      setGenerateTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't generate contract");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await contractTemplateService.remove(deleteTarget._id);
      toast.success("Template deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete template");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Template",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileCheck2 size={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-caption-strong">{row.name}</span>
            {row.isDefault && <Star size={12} className="text-warning fill-warning" />}
          </div>
        </div>
      ),
    },
    { key: "contractType", header: "Contract Type", render: (row) => row.contractType?.name || "—" },
    { key: "variables", header: "Variables", render: (row) => row.variables?.length || 0 },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openGenerate(row)}
            aria-label={`Generate contract from ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center text-ink-muted48 hover:text-primary"
          >
            <Sparkles size={15} />
          </button>
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
          <h1 className="text-display-md">Contract Templates</h1>
          <p className="text-caption text-ink-muted48 mt-1">Reusable formats for generating employee contracts.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Template
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search templates…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={templates}
          loading={loading}
          emptyTitle="No contract templates yet"
          emptyDescription="Add your first template to speed up contract creation."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Template" : "Add Contract Template"} width="max-w-2xl">
        <ContractTemplateForm
          initialValues={editing}
          contractTypes={contractTypes}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!generateTarget} onClose={() => setGenerateTarget(null)} title={`Generate Contract — ${generateTarget?.name || ""}`} width="max-w-xl">
        {generateTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Employee"
                required
                value={generateForm.employee}
                onChange={(e) => setGenerateForm({ ...generateForm, employee: e.target.value })}
                options={[{ value: "", label: "Select employee…" }, ...employees.map((e) => ({ value: e._id, label: `${e.name} (${e.employeeId})` }))]}
              />
              <TextField
                label="Contract Number"
                required
                value={generateForm.contractNumber}
                onChange={(e) => setGenerateForm({ ...generateForm, contractNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField label="Start Date" type="date" required value={generateForm.startDate} onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })} />
              <TextField label="End Date" type="date" value={generateForm.endDate} onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })} />
              <TextField label="Basic Salary" type="number" min="0" value={generateForm.basicSalary} onChange={(e) => setGenerateForm({ ...generateForm, basicSalary: e.target.value })} />
            </div>

            {Object.keys(generateForm.values || {}).length > 0 && (
              <div>
                <label className="block text-caption-strong text-ink-muted80 mb-1.5">Template Variables</label>
                <div className="space-y-2">
                  {Object.keys(generateForm.values).map((key) => (
                    <TextField
                      key={key}
                      label={key}
                      value={generateForm.values[key]}
                      onChange={(e) => setGenerateForm({ ...generateForm, values: { ...generateForm.values, [key]: e.target.value } })}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setGenerateTarget(null)} disabled={generating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} loading={generating}>
                Generate Contract
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete template?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}