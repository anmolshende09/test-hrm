import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Key, Lock, Unlock, History, LayoutGrid, List } from "lucide-react";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { SelectField } from "../components/common/FormField";
import UserForm from "../components/user/UserForm";
import UserPasswordForm from "../components/user/UserPasswordForm";
import UserAvatar from "../components/user/UserAvatar";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "employee", label: "Employee" },
];

const ROLE_LABELS = { admin: "Admin", hr_manager: "HR Manager", employee: "Employee" };

export default function Users() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [roleFilter, setRoleFilter] = useState("");
  const [view, setView] = useState("list");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    userService
      .list({ search: debouncedSearch || undefined, role: roleFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setUsers(data.data);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (user) => {
    setEditing(user);
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
        await userService.update(editing._id, payload);
        toast.success("User updated");
      } else {
        await userService.create(payload);
        toast.success("User created");
      }
      closeModal();
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (payload) => {
    setPasswordSubmitting(true);
    try {
      await userService.updatePassword(passwordTarget._id, payload);
      toast.success("Password updated");
      setPasswordTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setStatusUpdatingId(user._id);
    try {
      await userService.updateStatus(user._id, !user.isActive);
      toast.success(user.isActive ? "Account locked" : "Account unlocked");
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update account status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget._id);
      toast.success("User deleted");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete user");
    } finally {
      setDeleting(false);
    }
  };

  const renderActions = (user) => (
    <div className="flex items-center gap-1">
      <button onClick={() => setViewTarget(user)} aria-label={`View ${user.name}`} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
        <Eye size={15} />
      </button>
      <button onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
        <Pencil size={15} />
      </button>
      <button onClick={() => setPasswordTarget(user)} aria-label={`Manage credentials for ${user.name}`} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
        <Key size={15} />
      </button>
      <button
        onClick={() => handleToggleStatus(user)}
        disabled={statusUpdatingId === user._id}
        aria-label={user.isActive ? `Lock ${user.name}` : `Unlock ${user.name}`}
        className={`press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center ${user.isActive ? "text-ink-muted48" : "text-warning"}`}
      >
        {user.isActive ? <Unlock size={15} /> : <Lock size={15} />}
      </button>
      {user._id !== currentUser?._id && (
        <button onClick={() => setDeleteTarget(user)} aria-label={`Delete ${user.name}`} className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );

  const columns = [
    {
      key: "index",
      header: "#",
      render: (row) => <span className="text-caption text-ink-muted48">{(pagination.page - 1) * 10 + users.indexOf(row) + 1}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.name} />
          <div>
            <span className="text-caption-strong block">{row.name}</span>
            <span className="text-fine-print text-ink-muted48">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Roles",
      render: (row) => (
        <span className="text-fine-print px-2 py-0.5 rounded-pill bg-primary/10 text-primary">{ROLE_LABELS[row.role] || row.role}</span>
      ),
    },
    { key: "joined", header: "Joined", render: (row) => formatDate(row.createdAt) },
    { key: "actions", header: "", render: renderActions },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Users Management</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage system users and their account access.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={History} onClick={() => toast.success("Activity history coming soon")} title="Activity history is not available yet">
            History
          </Button>
          <Button icon={Plus} onClick={openAdd}>
            Add User
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search..." className="max-w-sm" />
        <SelectField value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={ROLE_FILTER_OPTIONS} className="w-full sm:w-44" />

        <div className="flex items-center rounded-sm border border-hairline overflow-hidden shrink-0 ml-auto">
          <button onClick={() => setView("list")} aria-label="List view" className={`w-9 h-9 flex items-center justify-center ${view === "list" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}>
            <List size={15} />
          </button>
          <button onClick={() => setView("grid")} aria-label="Grid view" className={`w-9 h-9 flex items-center justify-center ${view === "grid" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}>
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <Table columns={columns} data={users} loading={loading} emptyTitle="No users yet" emptyDescription="Add your first system user." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="bg-canvas border border-hairline rounded-lg p-lg">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} size={44} />
                  <div className="min-w-0">
                    <p className="text-caption-strong truncate">{user.name}</p>
                    <p className="text-fine-print text-ink-muted48 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-fine-print px-2 py-0.5 rounded-pill bg-primary/10 text-primary">{ROLE_LABELS[user.role] || user.role}</span>
                  <span className="text-fine-print text-ink-muted48">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-hairline">{renderActions(user)}</div>
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit User" : "Add New User"}>
        <UserForm initialValues={editing} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.name || "User Details"}>
        {viewTarget && (
          <div className="space-y-3 text-caption">
            <div className="flex items-center gap-3">
              <UserAvatar name={viewTarget.name} size={48} />
              <div>
                <p className="text-body-strong">{viewTarget.name}</p>
                <p className="text-ink-muted48">{viewTarget.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-ink-muted48 block">Role</span>
                <span className="text-caption-strong">{ROLE_LABELS[viewTarget.role] || viewTarget.role}</span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Status</span>
                <span className={`text-caption-strong ${viewTarget.isActive ? "text-success" : "text-danger"}`}>
                  {viewTarget.isActive ? "Active" : "Locked"}
                </span>
              </div>
              <div>
                <span className="text-ink-muted48 block">Joined</span>
                <span className="text-caption-strong">{formatDate(viewTarget.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!passwordTarget} onClose={() => setPasswordTarget(null)} title="Manage Credentials">
        {passwordTarget && (
          <UserPasswordForm user={passwordTarget} onSubmit={handlePasswordSubmit} onCancel={() => setPasswordTarget(null)} submitting={passwordSubmitting} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete user?"
        description={`This will permanently remove "${deleteTarget?.name}"'s account and revoke their access.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
