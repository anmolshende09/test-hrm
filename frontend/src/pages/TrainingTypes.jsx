import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Award } from "lucide-react";
import { trainingTypeService } from "../services/trainingTypeService";
import { branchService } from "../services/branchService";
import { departmentService } from "../services/departmentService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import TrainingTypeForm from "../components/trainingType/TrainingTypeForm";
import { useDebounce } from "../hooks/useDebounce";

export default function TrainingTypes() {
  const toast = useToast();
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [branchFilter, setBranchFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    trainingTypeService
      .list({
        search: debouncedSearch || undefined,
        branch: branchFilter || undefined,
        department: departmentFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setTrainingTypes(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load training types"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, branchFilter, departmentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (trainingType) => {
    setEditing(trainingType);
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
        await trainingTypeService.update(editing._id, payload);
        toast.success("Training type updated");
      } else {
        await trainingTypeService.create(payload);
        toast.success("Training type created");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (trainingType) => {
    try {
      const { data } = await trainingTypeService.get(trainingType._id);
      setViewTarget(data.data);
    } catch {
      toast.error("Couldn't load training type");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await trainingTypeService.remove(deleteTarget._id);
      toast.success("Training type deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete training type");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "index",
      header: "#",
      // Table's render signature only confirmed to pass (row) in this project's
      // other pages, not an index — so the row number is derived from the
      // array already in scope instead of relying on an unconfirmed 2nd arg.
      render: (row) => <span className="text-caption text-ink-muted48">{(pagination.page - 1) * 10 + trainingTypes.indexOf(row) + 1}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-warning-soft text-warning flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    {
      key: "departments",
      header: "Departments",
      render: (row) =>
        row.departments?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {row.departments.map((d) => (
              <span key={d._id} className="text-fine-print px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted80">
                {d.name} / {row.branch?.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-caption text-ink-muted48">—</span>
        ),
    },
    {
      key: "programCount",
      header: "Programs",
      render: (row) => row.programCount ?? 0,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openView(row)}
            aria-label={`View ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Eye size={15} />
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
          <h1 className="text-display-md">Training Types</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage training types used to categorize training programs.</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Add Training Type
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search..." className="max-w-sm" />
        <SelectField
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          options={[{ value: "", label: "All Branches" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
          className="w-full sm:w-48"
        />
        <SelectField
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
          className="w-full sm:w-48"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={trainingTypes}
          loading={loading}
          emptyTitle="No training types yet"
          emptyDescription="Add your first training type to start categorizing training programs."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Training Type" : "Add New Training Type"}>
        <TrainingTypeForm
          initialValues={editing}
          branches={branches}
          departments={departments}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.name || "Training Type"}>
        {viewTarget && (
          <div className="space-y-3 text-caption">
            <div>
              <span className="text-ink-muted48 block">Description</span>
              <span className="text-ink-muted80">{viewTarget.description || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-ink-muted48 block">Branch</span>
                <span className="text-caption-strong">{viewTarget.branch?.name || "—"}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Duration</span>
                <span className="text-caption-strong">{viewTarget.durationHours != null ? `${viewTarget.durationHours}h` : "—"}</span>
              </div>
            </div>
            <div>
              <span className="text-ink-muted48 block">Departments</span>
              {viewTarget.departments?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {viewTarget.departments.map((d) => (
                    <span key={d._id} className="text-fine-print px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted80">
                      {d.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-ink-muted80">—</span>
              )}
            </div>
            <div>
              <span className="text-ink-muted48 block">Programs</span>
              <span className="text-caption-strong">{viewTarget.programCount ?? 0}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete training type?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
