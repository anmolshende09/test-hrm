import React, { useEffect, useState } from "react";
import {
  Plus,
  Home,
  Folder,
  FolderPlus,
  HardDrive,
  Search,
  LayoutGrid,
  List,
  ArrowDownWideNarrow,
  FileText,
  Image as ImageIcon,
  Files,
} from "lucide-react";
import { mediaFileService } from "../services/mediaFileService";
import { mediaFolderService } from "../services/mediaFolderService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { TextField } from "../components/common/FormField";
import MediaUploadModal from "../components/mediaLibrary/MediaUploadModal";
import MediaDetailsModal from "../components/mediaLibrary/MediaDetailsModal";
import { useDebounce } from "../hooks/useDebounce";

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

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Date ↓" },
  { value: "createdAt", label: "Date ↑" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-size", label: "Size ↓" },
  { value: "size", label: "Size ↑" },
];

export default function MediaLibrary() {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, totalImages: 0, totalStorage: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState(""); // "" = All Files
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [sort, setSort] = useState("-createdAt");
  const [view, setView] = useState("grid");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [detailsFile, setDetailsFile] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);

  const loadFolders = () => mediaFolderService.list().then(({ data }) => setFolders(data.data)).catch(() => {});
  const loadStats = () => mediaFileService.stats().then(({ data }) => setStats(data.data)).catch(() => {});

  const loadFiles = () => {
    setLoading(true);
    mediaFileService
      .list({
        search: debouncedSearch || undefined,
        folder: selectedFolder || undefined,
        sort,
        limit: 100,
      })
      .then(({ data }) => setFiles(data.data))
      .catch(() => toast.error("Couldn't load media files"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFolders();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => loadFiles(), [debouncedSearch, selectedFolder, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAll = () => {
    loadFiles();
    loadFolders();
    loadStats();
  };

  const handleUpload = async (formData) => {
    setUploading(true);
    try {
      await mediaFileService.upload(formData);
      toast.success("Files uploaded");
      setUploadOpen(false);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    setCreatingFolder(true);
    try {
      await mediaFolderService.create({ name: newFolderName });
      toast.success("Folder created");
      setNewFolderName("");
      setNewFolderOpen(false);
      loadFolders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleSaveDetails = async (payload) => {
    setSavingDetails(true);
    try {
      const { data } = await mediaFileService.update(detailsFile._id, payload);
      setDetailsFile(data.data);
      toast.success("File updated");
      loadFiles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update file");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDeleteFile = async () => {
    setDeletingFile(true);
    try {
      await mediaFileService.remove(detailsFile._id);
      toast.success("File deleted");
      setDetailsFile(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete file");
    } finally {
      setDeletingFile(false);
    }
  };

  const isImage = (file) => file.fileType?.startsWith("image/");
  const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Media Library</h1>
          <p className="text-caption text-ink-muted48 mt-1">Manage your media files and organize them in folders</p>
        </div>
        <Button icon={Plus} onClick={() => setUploadOpen(true)}>
          Upload Media
        </Button>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="border-b md:border-b-0 md:border-r border-hairline p-lg space-y-6">
            <div>
              <p className="text-fine-print font-semibold uppercase tracking-wider text-ink-muted48 mb-2">Quick Access</p>
              <button
                onClick={() => setSelectedFolder("")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-caption transition-colors ${
                  selectedFolder === "" ? "bg-primary/10 text-primary" : "text-ink-muted80 hover:bg-canvas-parchment"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Home size={15} /> All Files
                </span>
                <span className="text-fine-print">{stats.totalFiles}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-fine-print font-semibold uppercase tracking-wider text-ink-muted48">Folders</p>
                <button onClick={() => setNewFolderOpen(true)} aria-label="Add folder" className="w-6 h-6 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
                  <FolderPlus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {folders.length === 0 && <p className="text-fine-print text-ink-muted48">No folders yet.</p>}
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder._id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-caption truncate transition-colors ${
                      selectedFolder === folder._id ? "bg-primary/10 text-primary" : "text-ink-muted80 hover:bg-canvas-parchment"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Folder size={15} className="shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </span>
                    <span className="text-fine-print shrink-0">{folder.fileCount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-fine-print font-semibold uppercase tracking-wider text-ink-muted48 mb-2">Storage</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-canvas-parchment">
                <HardDrive size={15} className="text-ink-muted48" />
                <div>
                  <p className="text-fine-print text-ink-muted48">Used</p>
                  <p className="text-caption-strong">{formatFileSize(stats.totalStorage)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="p-lg space-y-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted48" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media files..."
                  className="w-full h-10 pl-9 pr-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
                />
              </div>

              <div className="flex items-center rounded-sm border border-hairline overflow-hidden shrink-0">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={`w-9 h-9 flex items-center justify-center ${view === "grid" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={`w-9 h-9 flex items-center justify-center ${view === "list" ? "bg-primary text-white" : "text-ink-muted48 hover:bg-canvas-parchment"}`}
                >
                  <List size={15} />
                </button>
              </div>

              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-sm border border-hairline text-caption appearance-none focus:outline-none focus:ring-2 focus:ring-primary-focus"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowDownWideNarrow size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted48 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-caption text-ink-muted48">
              <span className="flex items-center gap-1.5"><Files size={14} /> {stats.totalFiles} Files</span>
              <span className="flex items-center gap-1.5"><HardDrive size={14} /> {formatFileSize(stats.totalStorage)}</span>
              <span className="flex items-center gap-1.5"><ImageIcon size={14} /> {stats.totalImages} Images</span>
            </div>

            {loading ? (
              <LoadingSpinner label="Loading media…" />
            ) : files.length === 0 ? (
              <EmptyState title="No media files found" description="Upload your first file to get started." />
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <button
                    key={file._id}
                    onClick={() => setDetailsFile(file)}
                    className="text-left bg-canvas border border-hairline rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-square bg-canvas-parchment flex items-center justify-center overflow-hidden">
                      {isImage(file) ? (
                        <img src={`${base}${file.filePath}`} alt={file.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-ink-muted48">
                          <FileText size={28} />
                          <span className="text-fine-print mt-1">{file.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-fine-print text-caption-strong truncate">{file.displayName}</p>
                      <p className="text-fine-print text-ink-muted48 mt-0.5">
                        {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {files.map((file) => (
                  <button
                    key={file._id}
                    onClick={() => setDetailsFile(file)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border border-hairline hover:bg-canvas-parchment text-left"
                  >
                    <div className="w-9 h-9 rounded-md bg-canvas-parchment flex items-center justify-center shrink-0 overflow-hidden">
                      {isImage(file) ? (
                        <img src={`${base}${file.filePath}`} alt={file.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={16} className="text-ink-muted48" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-caption-strong truncate">{file.displayName}</p>
                    </div>
                    <span className="text-fine-print text-ink-muted48 shrink-0">{formatFileSize(file.fileSize)}</span>
                    <span className="text-fine-print text-ink-muted48 shrink-0">{new Date(file.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media Files">
        <MediaUploadModal folders={folders} onUpload={handleUpload} onCancel={() => setUploadOpen(false)} uploading={uploading} />
      </Modal>

      <Modal open={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="New Folder">
        <div className="space-y-4">
          <TextField label="Folder Name" required value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Company - Policies" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setNewFolderOpen(false)} disabled={creatingFolder}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} loading={creatingFolder} disabled={!newFolderName}>
              Create Folder
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailsFile} onClose={() => setDetailsFile(null)} title="Media Details" width="max-w-3xl">
        {detailsFile && (
          <MediaDetailsModal
            file={detailsFile}
            onSave={handleSaveDetails}
            onDelete={handleDeleteFile}
            onClose={() => setDetailsFile(null)}
            saving={savingDetails}
            deleting={deletingFile}
          />
        )}
      </Modal>
    </div>
  );
}