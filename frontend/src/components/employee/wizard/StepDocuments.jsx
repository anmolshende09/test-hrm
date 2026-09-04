import React from "react";
import { Plus, X } from "lucide-react";
import { SelectField, TextField } from "../../common/FormField";

export default function StepDocuments({ documents, setDocuments, documentTypes, errors }) {
  const documentTypeOptions = [{ value: "", label: "Select document type" }, ...documentTypes.map((dt) => ({ value: dt._id, label: dt.name }))];

  const updateEntry = (index, patch) => {
    const next = [...documents];
    next[index] = { ...next[index], ...patch };
    setDocuments(next);
  };

  const handleFileChange = (index) => (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      updateEntry(index, { file: null, fileError: "File must be under 5MB" });
      return;
    }
    updateEntry(index, { file: file || null, fileError: "" });
  };

  const addDocument = () => setDocuments([...documents, { documentType: "", file: null, expiryDate: "", fileError: "" }]);
  const removeDocument = (index) => setDocuments(documents.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <h2 className="text-body-strong">Documents</h2>

      <div className="space-y-4">
        {documents.map((entry, index) => (
          <div key={index} className="border border-hairline rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption-strong text-ink-muted80">Document #{index + 1}</span>
              {documents.length > 1 && (
                <button type="button" onClick={() => removeDocument(index)} className="w-7 h-7 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="Document Type"
                required
                value={entry.documentType}
                error={errors?.[index]?.documentType}
                onChange={(e) => updateEntry(index, { documentType: e.target.value })}
                options={documentTypeOptions}
              />
              <div>
                <label className="block text-caption-strong text-ink-muted80 mb-1.5">
                  File <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/png,image/jpeg"
                  onChange={handleFileChange(index)}
                  className="w-full text-caption text-ink-muted48 file:mr-3 file:py-2 file:px-3.5 file:rounded-sm file:border-0 file:bg-canvas-parchment file:text-caption-strong file:text-ink-muted80"
                />
                {(entry.fileError || errors?.[index]?.file) && <p className="text-fine-print text-danger mt-1">{entry.fileError || errors[index].file}</p>}
              </div>
              <TextField label="Expiry Date (Optional)" type="date" value={entry.expiryDate} onChange={(e) => updateEntry(index, { expiryDate: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addDocument} className="flex items-center gap-1.5 text-caption text-primary hover:underline">
        <Plus size={14} /> Add Document
      </button>
    </div>
  );
}
