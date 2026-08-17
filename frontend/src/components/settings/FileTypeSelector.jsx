import React, { useState } from "react";
import { Search } from "lucide-react";
import Button from "../common/Button";

// Exact list from §6.7 (groups 1-3), preserved as documented.
export const FILE_TYPE_LIST = [
  "3dmf", "3dm", "avi", "ai", "bin", "bmp", "cab", "c", "c++", "class", "css", "csv", "cdr", "doc", "dot", "docx", "dwg", "eps", "exe", "gif", "gz", "gtar", "flv", "fh4",
  "inf", "jpe", "jpeg", "jpg", "js", "java", "latex", "log", "m3u", "midi", "mid", "mov", "mp4", "mp3", "mpeg", "mpg", "mp2", "ogg", "phtml", "php", "pdf", "pgp", "png", "pps", "ppt", "ppz", "pot", "ps",
  "rtf", "spr", "sprite", "stream", "swf", "svg", "sgml", "sgm", "tar", "tiff", "tif", "tgz", "tex", "txt", "vob", "wav", "wrl", "xla", "xls", "xlc", "xml", "zip", "json", "webp",
];

export default function FileTypeSelector({ selected, onChange }) {
  const [search, setSearch] = useState("");
  const selectedSet = new Set(selected);

  const filtered = FILE_TYPE_LIST.filter((ext) => ext.toLowerCase().includes(search.toLowerCase()));

  const toggle = (ext) => {
    const next = new Set(selectedSet);
    if (next.has(ext)) next.delete(ext);
    else next.add(ext);
    onChange(Array.from(next));
  };

  const selectAll = () => onChange(FILE_TYPE_LIST);
  const unselectAll = () => onChange([]);

  return (
    <div>
      <label className="block text-caption-strong text-ink-muted80 mb-1.5">Allowed File Types</label>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted48" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file types..."
            className="w-full h-9 pl-8 pr-3 rounded-sm border border-hairline text-caption focus:outline-none focus:ring-2 focus:ring-primary-focus"
          />
        </div>
        <Button type="button" variant="ghost" onClick={selectAll}>
          Select All
        </Button>
        <Button type="button" variant="ghost" onClick={unselectAll}>
          Unselect All
        </Button>
      </div>
      <div className="border border-hairline rounded-sm max-h-56 overflow-y-auto p-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {filtered.length === 0 && <p className="col-span-full text-caption text-ink-muted48">No matching file types.</p>}
        {filtered.map((ext) => (
          <label key={ext} className="flex items-center gap-1.5 text-caption cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSet.has(ext)}
              onChange={() => toggle(ext)}
              className="w-3.5 h-3.5 rounded-xs border-hairline text-primary focus:ring-primary-focus"
            />
            .{ext}
          </label>
        ))}
      </div>
    </div>
  );
}
