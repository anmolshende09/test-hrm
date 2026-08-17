import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Palmtree, FileDown, CalendarArrowDown } from "lucide-react";
import { holidayService } from "../services/holidayService";
import { branchService } from "../services/branchService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import HolidayForm from "../components/holiday/HolidayForm";
import { useDebounce } from "../hooks/useDebounce";
import { downloadBlob } from "../utils/download";
import { formatDate, titleCase } from "../utils/format";
import { HOLIDAY_CATEGORIES } from "../constants/options";

export default function Holidays() {
  const toast = useToast();
  const [holidays, setHolidays] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'ical' | null

  useEffect(() => {
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    holidayService
      .list({
        search: debouncedSearch || undefined,
        holidayCategory: categoryFilter || undefined,
        branch: branchFilter || undefined,
        page,
        limit: 10,
      })
      .then(({ data }) => {
        setHolidays(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load holidays"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, categoryFilter, branchFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (holiday) => {
    setEditing(holiday);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        await holidayService.update(editing._id, form);
        toast.success("Holiday updated");
      } else {
        await holidayService.create(form);
        toast.success("Holiday added");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await holidayService.remove(deleteTarget._id);
      toast.success("Holiday deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete holiday");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const { data } = type === "pdf" ? await holidayService.exportPDF() : await holidayService.exportICal();
      downloadBlob(data, type === "pdf" ? "holidays.pdf" : "holidays.ics");
    } catch (err) {
      toast.error("Couldn't export holidays");
    } finally {
      setExporting(null);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Holiday",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-success-soft text-success flex items-center justify-center shrink-0">
            <Palmtree size={16} />
          </div>
          <span className="text-caption-strong">{row.title}</span>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Date(s)",
      render: (row) =>
        row.startDate === row.endDate || formatDate(row.startDate) === formatDate(row.endDate)
          ? formatDate(row.startDate)
          : `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`,
    },
    { key: "holidayCategory", header: "Category", render: (row) => titleCase(row.holidayCategory || "—") },
    {
      key: "branches",
      header: "Branches",
      render: (row) => (row.branches?.length > 0 ? row.branches.map((b) => b.name).join(", ") : "All Branches"),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.title}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete ${row.title}`}
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
          <h1 className="text-display-md">Holidays</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage company holidays across branches.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={FileDown} onClick={() => handleExport("pdf")} loading={exporting === "pdf"}>
            Export PDF
          </Button>
          <Button variant="secondary" size="sm" icon={CalendarArrowDown} onClick={() => handleExport("ical")} loading={exporting === "ical"}>
            Export iCal
          </Button>
          <Button icon={Plus} onClick={openAdd}>
            Add Holiday
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search holidays…" className="max-w-sm" />
        <SelectField
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[{ value: "", label: "All Categories" }, ...HOLIDAY_CATEGORIES]}
          className="w-full sm:w-48"
        />
        <SelectField
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          options={[{ value: "", label: "All Branches" }, ...branches.map((b) => ({ value: b._id, label: b.name }))]}
          className="w-full sm:w-48"
        />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table
          columns={columns}
          data={holidays}
          loading={loading}
          emptyTitle="No holidays found"
          emptyDescription="Try different filters, or add your first holiday."
        />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Holiday" : "Add Holiday"}>
        <HolidayForm initialValues={editing} branches={branches} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete holiday?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
