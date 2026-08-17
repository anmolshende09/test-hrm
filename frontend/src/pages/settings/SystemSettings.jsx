import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toggle from "../../components/common/Toggle";
import { SelectField } from "../../components/common/FormField";

// Each dropdown intentionally has only ONE option — the value documented
// in the spec. The full option lists (other languages, date formats,
// timezones) were never specified, and the spec explicitly says not to
// invent them. These are real, working <select> controls; they're just
// honestly limited to what's actually known.
const LANGUAGE_OPTIONS = [{ value: "en", label: "English" }];
const DATE_FORMAT_OPTIONS = [{ value: "Y-m-d", label: "Y-m-d (2025-01-01)" }];
const TIME_FORMAT_OPTIONS = [{ value: "H:i", label: "H:i (13:30)" }];
const TIMEZONE_OPTIONS = [{ value: "UTC", label: "UTC" }];

export default function SystemSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then(({ data }) => setForm(data.data.system))
      .catch(() => toast.error("Couldn't load system settings"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSystem(form);
      toast.success("System settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save system settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingSpinner label="Loading system settings…" />;

  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-6">
      <div>
        <h2 className="text-body-strong">System Settings</h2>
        <p className="text-caption text-ink-muted48 mt-0.5">Configure system-wide settings for your application</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Default Language" value={form.defaultLanguage} onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })} options={LANGUAGE_OPTIONS} />
        <SelectField label="Default Timezone" value={form.defaultTimezone} onChange={(e) => setForm({ ...form, defaultTimezone: e.target.value })} options={TIMEZONE_OPTIONS} />
        <div>
          <SelectField label="Date Format" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })} options={DATE_FORMAT_OPTIONS} />
          <p className="text-fine-print text-ink-muted48 mt-1">Example: 2025-01-01</p>
        </div>
        <div>
          <SelectField label="Time Format" value={form.timeFormat} onChange={(e) => setForm({ ...form, timeFormat: e.target.value })} options={TIME_FORMAT_OPTIONS} />
          <p className="text-fine-print text-ink-muted48 mt-1">Example: 13:30</p>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-hairline">
        <div className="pt-4">
          <Toggle
            checked={form.ipRestriction}
            onChange={(v) => setForm({ ...form, ipRestriction: v })}
            label="IP Restriction"
            description="Enable IP address restrictions for enhanced security"
          />
        </div>
        <Toggle
          checked={form.landingPage}
          onChange={(v) => setForm({ ...form, landingPage: v })}
          label="Landing Page"
          description="Enable or disable the public landing page"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button icon={Save} onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
