import React, { useState } from "react";
import { Eye, Download, Trash2, Copy, FileText, ImageIcon } from "lucide-react";
import Button from "../common/Button";
import { TextField } from "../common/FormField";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export default function MediaDetailsModal({ file, onSave, onDelete, onClose, saving, deleting }) {
  const [displayName, setDisplayName] = useState(file.displayName);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isImage = file.fileType?.startsWith("image/");
  const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");
  const fullUrl = `${base}${file.filePath}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
  };

  const handleSaveName = () => {
    if (displayName !== file.displayName) onSave({ displayName });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-canvas-parchment rounded-lg flex items-center justify-center min-h-[240px] p-4">
        {isImage ? (
          <img src={fullUrl} alt={file.displayName} className="max-h-64 max-w-full object-contain rounded-sm" />
        ) : (
          <div className="flex flex-col items-center text-ink-muted48">
            <FileText size={48} />
            <span className="text-caption-strong mt-2">{file.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <TextField label="File Name" value={file.fileName} disabled />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <Button type="button" onClick={handleSaveName} loading={saving} disabled={displayName === file.displayName}>
            Save
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-caption">
          <div>
            <span className="text-ink-muted48 block">File Type</span>
            <span className="text-caption-strong">{file.fileType}</span>
          </div>
          <div>
            <span className="text-ink-muted48 block">File Size</span>
            <span className="text-caption-strong">{formatFileSize(file.fileSize)}</span>
          </div>
          <div>
            <span className="text-ink-muted48 block">Upload Date</span>
            <span className="text-caption-strong">{new Date(file.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-caption-strong text-ink-muted80 mb-1.5">File URL</label>
          <div className="flex items-center gap-2">
            <input readOnly value={fullUrl} className="flex-1 h-9 px-3 rounded-sm border border-hairline text-fine-print text-ink-muted48 bg-canvas-parchment truncate" />
            <button onClick={handleCopyUrl} className="w-9 h-9 rounded-sm border border-hairline flex items-center justify-center text-ink-muted48 hover:bg-canvas-parchment shrink-0">
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-hairline space-y-2">
          <label className="block text-caption-strong text-ink-muted80">Actions</label>
          <div className="flex flex-col gap-2">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="press-active flex items-center gap-2 px-3.5 h-10 rounded-sm border border-hairline text-caption-strong text-ink-muted80 hover:bg-canvas-parchment">
              <Eye size={15} /> View
            </a>
            <a href={fullUrl} download={file.fileName} className="press-active flex items-center gap-2 px-3.5 h-10 rounded-sm border border-hairline text-caption-strong text-ink-muted80 hover:bg-canvas-parchment">
              <Download size={15} /> Download
            </a>
            {!confirmingDelete ? (
              <button onClick={() => setConfirmingDelete(true)} className="press-active flex items-center gap-2 px-3.5 h-10 rounded-sm border border-danger/30 text-caption-strong text-danger hover:bg-danger-soft">
                <Trash2 size={15} /> Delete File
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="press-active flex-1 flex items-center justify-center gap-2 px-3.5 h-10 rounded-pill bg-danger text-white text-caption-strong disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
                <Button type="button" variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}