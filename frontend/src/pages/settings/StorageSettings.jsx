import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Tabs from "../../components/common/Tabs";
import { TextField } from "../../components/common/FormField";
import FileTypeSelector from "../../components/settings/FileTypeSelector";

const TABS = [
  { value: "local", label: "Local Storage" },
  { value: "aws_s3", label: "AWS S3" },
  { value: "wasabi", label: "Wasabi" },
];

export default function StorageSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState(null);
  const [activeTab, setActiveTab] = useState("local");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then(({ data }) => {
        setStorage(data.data.storage);
        setActiveTab(data.data.storage.activeProvider || "local");
      })
      .catch(() => toast.error("Couldn't load storage settings"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLocal = (patch) => setStorage({ ...storage, local: { ...storage.local, ...patch } });
  const setAws = (patch) => setStorage({ ...storage, awsS3: { ...storage.awsS3, ...patch } });

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateStorage({
        activeProvider: activeTab,
        local: activeTab === "local" ? storage.local : undefined,
        awsS3: activeTab === "aws_s3" ? storage.awsS3 : undefined,
      });
      toast.success("Storage settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save storage settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !storage) return <LoadingSpinner label="Loading storage settings…" />;

  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-6">
      <div>
        <h2 className="text-body-strong">Storage Settings</h2>
        <p className="text-caption text-ink-muted48 mt-0.5">Configure file storage settings for your application</p>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "local" && (
        <div className="space-y-4 pt-2">
          <h3 className="text-body-strong">Local Storage Settings</h3>
          <FileTypeSelector selected={storage.local.allowedFileTypes} onChange={(v) => setLocal({ allowedFileTypes: v })} />
          <TextField
            label="Max Upload Size (KB)"
            type="number"
            min="0"
            value={storage.local.maxUploadSizeKB}
            onChange={(e) => setLocal({ maxUploadSizeKB: Number(e.target.value) })}
          />
        </div>
      )}

      {activeTab === "aws_s3" && (
        <div className="space-y-4 pt-2">
          <h3 className="text-body-strong">AWS S3 Storage Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="AWS Access Key ID" value={storage.awsS3.accessKeyId} onChange={(e) => setAws({ accessKeyId: e.target.value })} placeholder="AKIAIOSFODNN7EXAMPLE" />
            <TextField label="AWS Secret Access Key" type="password" value={storage.awsS3.secretAccessKey || ""} onChange={(e) => setAws({ secretAccessKey: e.target.value })} placeholder="Leave blank to keep current key" />
            <TextField label="AWS Default Region" value={storage.awsS3.region} onChange={(e) => setAws({ region: e.target.value })} placeholder="us-east-1" />
            <TextField label="AWS Bucket" value={storage.awsS3.bucket} onChange={(e) => setAws({ bucket: e.target.value })} placeholder="my-bucket-name" />
            <TextField label="AWS URL" value={storage.awsS3.url} onChange={(e) => setAws({ url: e.target.value })} placeholder="https://s3.amazonaws.com" />
            <TextField label="AWS Endpoint" value={storage.awsS3.endpoint} onChange={(e) => setAws({ endpoint: e.target.value })} placeholder="https://s3.us-east-1.amazonaws.com" />
          </div>
          <FileTypeSelector selected={storage.awsS3.allowedFileTypes} onChange={(v) => setAws({ allowedFileTypes: v })} />
          <TextField
            label="Max Upload Size (KB)"
            type="number"
            min="0"
            value={storage.awsS3.maxUploadSizeKB}
            onChange={(e) => setAws({ maxUploadSizeKB: Number(e.target.value) })}
          />
        </div>
      )}

      {activeTab === "wasabi" && (
        <p className="text-caption text-ink-muted48 pt-2">
          Wasabi's configuration fields weren't captured in the source spec's screenshots, so there's nothing to build here yet — send the details (access key, secret, bucket, endpoint, region) and I'll add it.
        </p>
      )}

      {activeTab !== "wasabi" && (
        <div className="flex justify-end pt-2">
          <Button icon={Save} onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
