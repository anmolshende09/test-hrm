import React from "react";

const baseInputClasses =
  "w-full h-11 rounded-sm border bg-canvas px-3.5 text-body placeholder:text-ink-muted48 focus:outline-none transition-colors";

const borderFor = (error) =>
  error ? "border-danger focus:border-danger" : "border-hairline focus:border-primary-focus";

function Label({ label, required }) {
  if (!label) return null;
  return (
    <label className="block text-caption-strong text-ink-muted80 mb-1.5">
      {label} {required && <span className="text-danger">*</span>}
    </label>
  );
}

function ErrorText({ error }) {
  if (!error) return null;
  return <p className="text-fine-print text-danger mt-1">{error}</p>;
}

export function TextField({ label, required, error, className = "", ...props }) {
  return (
    <div className={className}>
      <Label label={label} required={required} />
      <input className={`${baseInputClasses} ${borderFor(error)}`} {...props} />
      <ErrorText error={error} />
    </div>
  );
}

export function TextAreaField({ label, required, error, rows = 3, className = "", ...props }) {
  return (
    <div className={className}>
      <Label label={label} required={required} />
      <textarea
        rows={rows}
        className={`${baseInputClasses} h-auto py-2.5 resize-none ${borderFor(error)}`}
        {...props}
      />
      <ErrorText error={error} />
    </div>
  );
}

export function SelectField({ label, required, error, options = [], placeholder, className = "", ...props }) {
  return (
    <div className={className}>
      <Label label={label} required={required} />
      <select className={`${baseInputClasses} ${borderFor(error)}`} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
    </div>
  );
}
