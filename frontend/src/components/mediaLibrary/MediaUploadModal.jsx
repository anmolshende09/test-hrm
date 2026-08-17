import React, { useRef, useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import Button from "../common/Button";
import { SelectField } from "../common/FormField";

export default function MediaUploadModal({ folders, onUpload, onCancel, uploading }) {
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const folderOptions = [{ value: "", label: "No folder (All Files)" }, ...folders.map((f) => ({ value: f._id, label: f.name }))];

  const addFiles = (fileList) => setFiles((prev) => [...prev, ...Array.from(fileList)]);
  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (folder) formData.append("folder", folder);
    onUpload(formData);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-hairline bg-canvas-parchment"
        }`}
      >
        <UploadCloud size={28} className="mx-auto text-ink-muted48 mb-2" />
        <p className="text-body-strong">Upload your images</p>
        <p className="text-caption text-ink-muted48 mt-1">Drag and drop your images here, or click to browse</p>
        <div className="mt-3">
          <Button type="button" variant="ghost" icon={UploadCloud} onClick={(e) => e.stopPropagation()}>
            Choose Files
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,.pdf"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between px-3 py-2 rounded-sm bg-canvas-parchment">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-ink-muted48 shrink-0" />
                <span className="text-caption text-ink-muted80 truncate">{file.name}</span>
              </div>
              <button onClick={() => removeFile(index)} className="w-6 h-6 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <SelectField label="Folder (optional)" value={folder} onChange={(e) => setFolder(e.target.value)} options={folderOptions} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={uploading} disabled={files.length === 0}>
          Upload {files.length > 0 ? `(${files.length})` : ""}
        </Button>
      </div>
    </div>
  );
}