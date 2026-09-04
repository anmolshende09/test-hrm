import React from "react";
import { TextField } from "../../common/FormField";

export default function StepContact({ form, setForm, errors }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-body-strong mb-3">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <TextField label="Address Line 1" required value={form.addressLine1} error={errors.addressLine1} onChange={set("addressLine1")} placeholder="123 Main Street, Suite 100" />
          </div>
          <div className="sm:col-span-2">
            <TextField label="Address Line 2 (Optional)" value={form.addressLine2} onChange={set("addressLine2")} placeholder="Apartment, Floor, Building" />
          </div>
          <TextField label="City" required value={form.city} error={errors.city} onChange={set("city")} placeholder="New York" />
          <TextField label="State/Province" required value={form.state} error={errors.state} onChange={set("state")} placeholder="California" />
          <TextField label="Country" required value={form.country} error={errors.country} onChange={set("country")} placeholder="United States" />
          <TextField label="Postal/Zip Code" required value={form.postalCode} error={errors.postalCode} onChange={set("postalCode")} placeholder="10001" />
        </div>
      </div>

      <div className="pt-4 border-t border-hairline">
        <h2 className="text-body-strong mb-3">Emergency Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Name" required value={form.emergencyName} error={errors.emergencyName} onChange={set("emergencyName")} placeholder="Jane Doe" />
          <TextField label="Relationship" required value={form.emergencyRelationship} error={errors.emergencyRelationship} onChange={set("emergencyRelationship")} placeholder="Spouse" />
          <TextField label="Phone Number" required value={form.emergencyPhone} error={errors.emergencyPhone} onChange={set("emergencyPhone")} placeholder="+1 234 567 8900" />
        </div>
      </div>
    </div>
  );
}
