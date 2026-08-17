import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toggle from "../../components/common/Toggle";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function WorkingDaysSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then(({ data }) => setForm(data.data.workingDays))
      .catch(() => toast.error("Couldn't load working days settings"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateWorkingDays(form);
      toast.success("Working days saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save working days");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingSpinner label="Loading working days…" />;

  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-6">
      <div>
        <h2 className="text-body-strong">Working Days Settings</h2>
        <p className="text-caption text-ink-muted48 mt-0.5">Configure which days are working days for your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DAYS.map((day) => (
          <div key={day.key} className="px-4 py-3 rounded-sm border border-hairline">
            <Toggle checked={form[day.key]} onChange={(v) => setForm({ ...form, [day.key]: v })} label={day.label} />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button icon={Save} onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
