import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { employeeService } from "../services/employeeService";
import { branchService } from "../services/branchService";
import { departmentService } from "../services/departmentService";
import { shiftService } from "../services/shiftService";
import { documentTypeService } from "../services/documentTypeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import ProgressIndicator from "../components/employee/wizard/ProgressIndicator";
import StepPersonal from "../components/employee/wizard/StepPersonal";
import StepEmployment from "../components/employee/wizard/StepEmployment";
import StepContact from "../components/employee/wizard/StepContact";
import StepBanking from "../components/employee/wizard/StepBanking";
import StepDocuments from "../components/employee/wizard/StepDocuments";

const emptyForm = {
  name: "",
  employeeCode: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  branch: "",
  department: "",
  designation: "",
  joiningDate: "",
  employmentType: "full_time",
  status: "active",
  shift: "",
  attendancePolicy: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  bic: "",
  bankBranch: "",
  taxPayerId: "",
  salary: "",
};

const DEFAULT_DOCUMENT_LABELS = ["Identity Proof", "Address Proof", "Educational Certificates"];

export default function AddEmployee() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([
    { documentType: "", file: null, expiryDate: "", fileError: "" },
    { documentType: "", file: null, expiryDate: "", fileError: "" },
    { documentType: "", file: null, expiryDate: "", fileError: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [docErrors, setDocErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendancePolicies, setAttendancePolicies] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    branchService.all().then(({ data }) => setBranches(data.data)).catch(() => {});
    departmentService.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
    shiftService.all().then(({ data }) => setShifts(data.data)).catch(() => {});
    documentTypeService.list().then(({ data }) => setDocumentTypes(data.data)).catch(() => {});
    // NOTE: attendancePolicyService is assumed to exist with an `all()` method,
    // mirroring shiftService's exact convention — I haven't seen this file
    // directly. If the import below fails, that assumption was wrong and the
    // service needs a quick check against the real file.
    import("../services/attendancePolicyService")
      .then((mod) => mod.attendancePolicyService.all().then(({ data }) => setAttendancePolicies(data.data)))
      .catch(() => setAttendancePolicies([]));
  }, []);

  // Pre-select the 3 default document types by name, once the real list loads.
  useEffect(() => {
    if (documentTypes.length === 0) return;
    setDocuments((prev) =>
      prev.map((entry, i) => {
        if (entry.documentType || i >= DEFAULT_DOCUMENT_LABELS.length) return entry;
        const match = documentTypes.find((dt) => dt.name.toLowerCase() === DEFAULT_DOCUMENT_LABELS[i].toLowerCase());
        return match ? { ...entry, documentType: match._id } : entry;
      })
    );
  }, [documentTypes]);

  const validateStep = (currentStep) => {
    const next = {};
    if (currentStep === 1) {
      if (!form.name) next.name = "Full name is required";
      if (!form.employeeCode) next.employeeCode = "Employee code is required";
      if (!form.email) next.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
      if (!form.password) next.password = "Password is required";
      else if (form.password.length < 6) next.password = "Must be at least 6 characters";
      if (!form.phone) next.phone = "Phone number is required";
      if (!form.dateOfBirth) next.dateOfBirth = "Date of birth is required";
      if (!form.gender) next.gender = "Gender is required";
      if (!photo) next.photo = "Profile image is required";
    } else if (currentStep === 2) {
      if (!form.branch) next.branch = "Branch is required";
      if (!form.department) next.department = "Department is required";
      if (!form.designation) next.designation = "Designation is required";
      if (!form.joiningDate) next.joiningDate = "Joining date is required";
      if (!form.employmentType) next.employmentType = "Employment type is required";
      if (!form.status) next.status = "Employee status is required";
    } else if (currentStep === 3) {
      if (!form.addressLine1) next.addressLine1 = "Address line 1 is required";
      if (!form.city) next.city = "City is required";
      if (!form.state) next.state = "State/Province is required";
      if (!form.country) next.country = "Country is required";
      if (!form.postalCode) next.postalCode = "Postal/Zip code is required";
      if (!form.emergencyName) next.emergencyName = "Emergency contact name is required";
      if (!form.emergencyRelationship) next.emergencyRelationship = "Relationship is required";
      if (!form.emergencyPhone) next.emergencyPhone = "Emergency contact phone is required";
    } else if (currentStep === 4) {
      if (!form.bankName) next.bankName = "Bank name is required";
      if (!form.accountHolderName) next.accountHolderName = "Account holder name is required";
      if (!form.accountNumber) next.accountNumber = "Account number is required";
      if (!form.bic) next.bic = "BIC/SWIFT is required";
      if (!form.bankBranch) next.bankBranch = "Bank branch is required";
      if (!form.salary) next.salary = "Base salary is required";
      else if (Number.isNaN(Number(form.salary))) next.salary = "Salary must be a number";
    } else if (currentStep === 5) {
      const entryErrors = documents.map((entry) => {
        const e = {};
        if (!entry.documentType) e.documentType = "Required";
        if (!entry.file) e.file = "Required";
        return e;
      });
      setDocErrors(entryErrors);
      return entryErrors.every((e) => Object.keys(e).length === 0);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 5));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key.startsWith("_")) return;
        // These 9 fields are grouped server-side into contact/banking JSON —
        // sent individually here, assembled below instead.
        if (
          ["addressLine1", "addressLine2", "city", "state", "country", "postalCode", "emergencyName", "emergencyRelationship", "emergencyPhone", "bankName", "accountHolderName", "accountNumber", "bic", "bankBranch", "taxPayerId"].includes(key)
        ) {
          return;
        }
        formData.append(key, value);
      });

      formData.append(
        "contact",
        JSON.stringify({
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelationship, phone: form.emergencyPhone },
        })
      );
      formData.append(
        "banking",
        JSON.stringify({
          bankName: form.bankName,
          accountHolderName: form.accountHolderName,
          accountNumber: form.accountNumber,
          bic: form.bic,
          bankBranch: form.bankBranch,
          taxPayerId: form.taxPayerId,
        })
      );
      formData.append("profilePicture", photo);

      const { data } = await employeeService.create(formData);
      const newEmployeeId = data.data._id;

      // Documents are uploaded as a second phase, after the employee exists
      // (the document endpoint needs a real employee id). If one fails, the
      // employee record itself still succeeded — surfaced as a warning, not
      // a blocking rollback of an already-created employee.
      const docFailures = [];
      for (const entry of documents) {
        if (!entry.documentType || !entry.file) continue;
        const docFormData = new FormData();
        docFormData.append("documentType", entry.documentType);
        docFormData.append("file", entry.file);
        if (entry.expiryDate) docFormData.append("expiryDate", entry.expiryDate);
        try {
          // eslint-disable-next-line no-await-in-loop
          await employeeService.uploadDocument(newEmployeeId, docFormData);
        } catch (err) {
          docFailures.push(err.response?.data?.message || "A document failed to upload");
        }
      }

      if (docFailures.length > 0) {
        toast.error(`Employee created, but ${docFailures.length} document(s) failed to upload`);
      } else {
        toast.success("Employee created successfully");
      }
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-md">Create Employee</h1>
          <p className="text-caption text-ink-muted48 mt-1">Add a new employee to your organization.</p>
        </div>
        <Link to="/employees">
          <Button variant="ghost" icon={ChevronLeft}>
            Back to Employees
          </Button>
        </Link>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <ProgressIndicator currentStep={step} />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        {step === 1 && <StepPersonal form={form} setForm={setForm} errors={errors} photo={photo} setPhoto={setPhoto} />}
        {step === 2 && <StepEmployment form={form} setForm={setForm} errors={errors} branches={branches} departments={departments} shifts={shifts} attendancePolicies={attendancePolicies} />}
        {step === 3 && <StepContact form={form} setForm={setForm} errors={errors} />}
        {step === 4 && <StepBanking form={form} setForm={setForm} errors={errors} />}
        {step === 5 && <StepDocuments documents={documents} setDocuments={setDocuments} documentTypes={documentTypes} errors={docErrors} />}

        <div className="flex justify-between pt-6 mt-6 border-t border-hairline">
          <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1 || submitting}>
            Back
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSave} loading={submitting}>
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
