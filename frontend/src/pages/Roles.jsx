import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { roleService } from "../services/roleService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useDebounce } from "../hooks/useDebounce";

export default function Roles() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    roleService
      .list({ search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => {
        setRoles(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load roles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await roleService.remove(deleteTarget._id);
      toast.success("Role deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete role");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Role",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <span className="text-caption-strong">{row.name}</span>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
    { key: "permissions", header: "Permissions", render: (row) => `${row.permissions?.length || 0} selected` },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/roles/${row._id}/edit`}
            aria-label={`Edit ${row.name}`}
            className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
          >
            <Pencil size={15} />
          </Link>
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
          <h1 className="text-display-md">Roles</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage roles and their permissions.</p>
        </div>
        <Link to="/roles/new">
          <Button icon={Plus}>Add Role</Button>
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search roles…" className="max-w-sm" />

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={roles} loading={loading} emptyTitle="No roles yet" emptyDescription="Add your first role to start assigning permissions." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete role?"
        description={`This will permanently remove the "${deleteTarget?.name}" role. Since Roles aren't yet linked to Users, deleting one doesn't affect anyone currently assigned it.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
