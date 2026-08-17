import React, { useEffect, useState } from "react";
import { Save, Send, Info } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { TextField, SelectField } from "../../components/common/FormField";

const PROVIDER_OPTIONS = [{ value: "smtp", label: "SMTP" }];
const ENCRYPTION_OPTIONS = [{ value: "tls", label: "TLS" }];

export default function EmailSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then(({ data }) => setForm({ ...data.data.email, smtpPassword: "" }))
      .catch(() => toast.error("Couldn't load email settings"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateEmail(form);
      toast.success("Email settings saved");
      setForm({ ...form, smtpPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save email settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient) {
      toast.error("Enter an email address to send a test message");
      return;
    }
    setSendingTest(true);
    try {
      await settingsService.sendTestEmail(testRecipient);
      toast.success("Test email sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send test email");
    } finally {
      setSendingTest(false);
    }
  };

  if (loading || !form) return <LoadingSpinner label="Loading email settings…" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-lg">
      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-4">
        <div>
          <h2 className="text-body-strong">Email Settings</h2>
          <p className="text-caption text-ink-muted48 mt-0.5">Configure email server settings for system notifications and communications</p>
        </div>

        <SelectField label="Email Provider" value={form.provider} onChange={set("provider")} options={PROVIDER_OPTIONS} />
        <TextField label="Mail Driver" required value={form.mailDriver} onChange={set("mailDriver")} />
        <TextField label="SMTP Host" required value={form.smtpHost} onChange={set("smtpHost")} placeholder="smtp.example.com" />

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-caption-strong text-ink-muted80">SMTP Port *</label>
            <Info size={12} className="text-ink-muted48" />
          </div>
          <TextField value={form.smtpPort} onChange={set("smtpPort")} placeholder="587" />
        </div>

        <TextField label="SMTP Username" required value={form.smtpUsername} onChange={set("smtpUsername")} placeholder="user@example.com" />
        <TextField label="SMTP Password" required type="password" value={form.smtpPassword} onChange={set("smtpPassword")} placeholder="Leave blank to keep current password" />
        <SelectField label="Mail Encryption" required value={form.mailEncryption} onChange={set("mailEncryption")} options={ENCRYPTION_OPTIONS} />
        <TextField label="From Address" required type="email" value={form.fromAddress} onChange={set("fromAddress")} placeholder="noreply@example.com" />
        <TextField label="From Name" required value={form.fromName} onChange={set("fromName")} placeholder="WorkDo System" />

        <div className="flex justify-end pt-2">
          <Button icon={Save} onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-3 h-fit">
        <h3 className="text-body-strong">Test Email Configuration</h3>
        <TextField label="Send Test To" type="email" value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} placeholder="test@example.com" />
        <p className="text-fine-print text-ink-muted48">Enter an email address to send a test message</p>
        <div>
          <Button icon={Send} onClick={handleSendTest} loading={sendingTest}>
            Send Test Email
          </Button>
        </div>
        <p className="text-fine-print text-ink-muted48 pt-1">
          Requires the <code>nodemailer</code> package and a saved SMTP configuration to work.
        </p>
      </div>
    </div>
  );
}
