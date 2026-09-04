import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Key, Lock, Unlock, Trash2 } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { initials, formatDate } from "../../utils/format";

export default function EmployeeGridCard({ employee, onChangePassword, onToggleLoginStatus, onDelete, statusUpdating }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg">
      <div className="flex items-center gap-3">
        {employee.profilePicture ? (
          <img src={employee.profilePicture} alt={employee.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-caption-strong shrink-0">
            {initials(employee.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-caption-strong truncate">{employee.name}</p>
          <p className="text-fine-print text-ink-muted48 truncate">{employee.email}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-caption text-ink-muted80">
        <p>{employee.employeeId}</p>
        <p>{employee.department?.name || "—"} · {employee.designation?.name || "—"}</p>
        <p className="text-fine-print text-ink-muted48">Joined {formatDate(employee.joiningDate)}</p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-hairline">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={employee.status} />
          <span
            className={`text-fine-print px-2 py-0.5 rounded-pill ${
              employee.loginActive === false ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
            }`}
          >
            {employee.loginActive === false ? "Login Inactive" : "Login Active"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3">
        <Link
          to={`/employees/${employee._id}`}
          title="View"
          className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
        >
          <Eye size={15} />
        </Link>
        <Link
          to={`/employees/${employee._id}?edit=1`}
          title="Edit"
          className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
        >
          <Pencil size={15} />
        </Link>
        <button
          onClick={() => onChangePassword(employee)}
          title="Change Password"
          className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
        >
          <Key size={15} />
        </button>
        <button
          onClick={() => onToggleLoginStatus(employee)}
          disabled={statusUpdating}
          title={employee.loginActive === false ? "Activate Login" : "Deactivate Login"}
          className={`press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center ${
            employee.loginActive === false ? "text-warning" : "text-ink-muted48"
          }`}
        >
          {employee.loginActive === false ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
        <button
          onClick={() => onDelete(employee)}
          title="Delete"
          className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
