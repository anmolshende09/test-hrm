import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileCheck2, Star, Sparkles, Copy } from "lucide-react";
import { documentTemplateService } from "../services/documentTemplateService";
import { documentCategoryService } from "../services/documentCategoryService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatusBadge from "../components/common/StatusBadge";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { TextField } from "../components/common/FormField";
import DocumentTemplateForm from "../components/documentTemplate/DocumentTemplateForm";
import { useDebounce } from "../hooks/useDebounce";

export default function DocumentTemplates() {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [generateValues, setGenerateValues] = useState({});
  const [generating, setGenerating] = useState(false);
  const [mergedContent, setMergedContent] = useState(null);

  useEffect(() => {
    documentCategoryService.all().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    documentTemplateService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setTemplates(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load document templates"))
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
        await documentTemplateService.update(editing._id, payload);
        toast.success("Template updated");
      } else {
        await documentTemplateService.create(payload);
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
    (template.placeholders || []).forEach((p) => {
      const defaultEntry = (template.defaultValues || []).find((dv) => dv.key === p);
      values[p] = defaultEntry?.value || "";
    });
    setGenerateValues(values);
    setMergedContent(null);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await documentTemplateService.generate(generateTarget._id, { values: generateValues });
      setMergedContent(data.data.mergedContent);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't generate document");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mergedContent);
    toast.success("Copied to clipboard");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentTemplateService.remove(deleteTarget._id);
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
    { key: "category", header: "Category", render: (row) => row.category?.name || "—" },
    { key: "fileFormat", header: "Format", render: (row) => row.fileFormat },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openGenerate(row)}
            aria-label={`Generate document from ${row.name}`}
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
          <h1 className="text-display-md">Document Templates</h1>
          <p className="text-caption text-ink-muted48 mt-1">Standardized formats for consistent document generation.</p>
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
          emptyTitle="No document templates yet"
          emptyDescription="Add your first template to standardize document generation."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Template" : "Add Document Template"} width="max-w-2xl">
        <DocumentTemplateForm
          initialValues={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!generateTarget} onClose={() => setGenerateTarget(null)} title={`Generate Document — ${generateTarget?.name || ""}`} width="max-w-xl">
        {generateTarget && (
          <div className="space-y-4">
            {Object.keys(generateValues).length === 0 ? (
              <p className="text-caption text-ink-muted48">This template has no placeholders — the content is ready to generate as-is.</p>
            ) : (
              <div className="space-y-2">
                <label className="block text-caption-strong text-ink-muted80">Fill In Placeholders</label>
                {Object.keys(generateValues).map((key) => (
                  <TextField
                    key={key}
                    label={key}
                    value={generateValues[key]}
                    onChange={(e) => setGenerateValues({ ...generateValues, [key]: e.target.value })}
                  />
                ))}
              </div>
            )}

            {mergedContent !== null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-caption-strong text-ink-muted80">Merged Content</label>
                  <button onClick={handleCopy} className="text-caption text-primary hover:underline flex items-center gap-1">
                    <Copy size={13} /> Copy
                  </button>
                </div>
                <div className="bg-canvas-parchment rounded-sm p-3 text-caption text-ink-muted80 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {mergedContent}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setGenerateTarget(null)} disabled={generating}>
                Close
              </Button>
              <Button onClick={handleGenerate} loading={generating}>
                {mergedContent !== null ? "Regenerate" : "Generate"}
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