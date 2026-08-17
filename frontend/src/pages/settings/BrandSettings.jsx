import React, { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Tabs from "../../components/common/Tabs";

const TABS = [
  { value: "logos", label: "Logos" },
  { value: "text", label: "Text" },
  { value: "theme", label: "Theme" },
];

function LogoField({ label, value, dark, onSelect, onRemove, base }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label className="block text-caption-strong text-ink-muted80 mb-1.5">{label}</label>
      <div className={`rounded-lg border border-hairline p-6 flex items-center justify-center h-32 ${dark ? "bg-void" : "bg-canvas-parchment"}`}>
        {value ? (
          <img src={`${base}${value}`} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-fine-print text-ink-muted48">No {label.toLowerCase()} set</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input readOnly value={value || "logo/"} className="flex-1 h-9 px-3 rounded-sm border border-hairline text-fine-print text-ink-muted48 bg-canvas-parchment truncate" />
        <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
          Browse
        </Button>
        {value && (
          <button onClick={onRemove} aria-label={`Remove ${label}`} className="w-9 h-9 rounded-sm border border-hairline flex items-center justify-center text-ink-muted48 hover:bg-danger-soft hover:text-danger">
            <X size={14} />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} />
      </div>
    </div>
  );
}

export default function BrandSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState(null);
  const [activeTab, setActiveTab] = useState("logos");
  const [pendingFiles, setPendingFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");

  useEffect(() => {
    settingsService
      .get()
      .then(({ data }) => setBrand(data.data.brand))
      .catch(() => toast.error("Couldn't load brand settings"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (field) => (file) => setPendingFiles((prev) => ({ ...prev, [field]: file }));

  const handleRemove = async (field) => {
    try {
      const { data } = await settingsService.removeBrandAsset(field);
      setBrand(data.data);
      toast.success("Asset removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't remove asset");
    }
  };

  const handleSave = async () => {
    if (Object.keys(pendingFiles).length === 0) {
      toast.success("Nothing to save");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(pendingFiles).forEach(([key, file]) => formData.append(key, file));
      const { data } = await settingsService.updateBrand(formData);
      setBrand(data.data);
      setPendingFiles({});
      toast.success("Brand settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save brand settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !brand) return <LoadingSpinner label="Loading brand settings…" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-lg">
      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-6">
        <div>
          <h2 className="text-body-strong">Brand Settings</h2>
          <p className="text-caption text-ink-muted48 mt-0.5">Customize your application's branding and appearance</p>
        </div>

        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === "logos" && (
          <div className="space-y-6 pt-2">
            <LogoField label="Logo Dark" value={brand.logoDark} onSelect={handleSelect("logoDark")} onRemove={() => handleRemove("logoDark")} base={base} />
            <LogoField label="Logo Light" value={brand.logoLight} dark onSelect={handleSelect("logoLight")} onRemove={() => handleRemove("logoLight")} base={base} />
            <LogoField label="Favicon" value={brand.favicon} onSelect={handleSelect("favicon")} onRemove={() => handleRemove("favicon")} base={base} />
          </div>
        )}

        {activeTab === "text" && (
          <p className="text-caption text-ink-muted48 pt-2">
            The Text tab's fields weren't captured in the source spec's screenshots, so there's nothing to build here yet — send the details and I'll add it.
          </p>
        )}

        {activeTab === "theme" && (
          <p className="text-caption text-ink-muted48 pt-2">
            The Theme tab's controls weren't captured in the source spec's screenshots, so there's nothing to build here yet — send the details and I'll add it.
          </p>
        )}

        {activeTab === "logos" && (
          <div className="flex justify-end pt-2">
            <Button icon={Save} onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <h3 className="text-body-strong mb-3">Live Preview</h3>
        <div className="rounded-lg border border-hairline overflow-hidden">
          <div className="bg-void p-3 flex items-center gap-2">
            {brand.logoLight ? <img src={`${base}${brand.logoLight}`} alt="" className="h-6" /> : <span className="text-white text-caption-strong">HRM</span>}
          </div>
          <div className="p-3 space-y-2 bg-canvas-parchment">
            <div className="h-2 w-3/4 rounded-pill bg-hairline" />
            <div className="h-2 w-1/2 rounded-pill bg-hairline" />
          </div>
          <div className="p-3 flex items-center gap-2 border-t border-hairline">
            <span className="text-fine-print px-2 py-0.5 rounded-pill bg-ink-muted80 text-white">system</span>
            <span className="text-fine-print px-2 py-0.5 rounded-pill bg-primary text-white">blue</span>
            <span className="text-fine-print px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted48">le...</span>
          </div>
          <p className="text-fine-print text-ink-muted48 text-center py-2 border-t border-hairline">© 2026 HRM</p>
        </div>
      </div>
    </div>
  );
}
