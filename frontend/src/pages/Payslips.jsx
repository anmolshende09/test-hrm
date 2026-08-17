import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { payslipService } from "../services/payslipService";
import { useToast } from "../context/ToastContext";
import Table from "../components/common/Table";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import { SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const now = new Date();

export default function Payslips() {
  const toast = useToast();
  const [payslips, setPayslips] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [viewPayslip, setViewPayslip] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    payslipService.list({ month, year, search: debouncedSearch || undefined, page, limit: 10 })
      .then(({ data }) => { setPayslips(data.data); setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages }); })
      .catch(() => toast.error("Couldn't load payslips"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, month, year]); // eslint-disable-line

  const monthOptions = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => { const y = now.getFullYear() - 2 + i; return { value: String(y), label: String(y) }; });

  const columns = [
    { key: "employee", header: "Employee", render: (r) => <div><p className="text-caption-strong">{r.employee?.name}</p><p className="text-fine-print text-ink-muted48">{r.employee?.employeeId}</p></div> },
    { key: "payDate", header: "Pay Date", render: (r) => formatDate(r.payDate) },
    { key: "basicSalary", header: "Basic", render: (r) => r.basicSalary?.toLocaleString() },
    { key: "grossPay", header: "Gross Pay", render: (r) => r.grossPay?.toLocaleString() },
    { key: "totalDeductions", header: "Deductions", render: (r) => r.totalDeductions?.toLocaleString() },
    { key: "netPay", header: "Net Pay", render: (r) => <span className="text-caption-strong text-success">{r.netPay?.toLocaleString()}</span> },
    { key: "actions", header: "", render: (r) => (
      <button onClick={() => setViewPayslip(r)} className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48">
        <FileText size={15} />
      </button>
    )},
  ];

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-display-md">Payslips</h1>
        <p className="text-caption text-ink-muted48 mt-1">View generated payslips by month.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" className="max-w-sm" />
        <SelectField value={month} onChange={(e) => setMonth(e.target.value)} options={monthOptions} className="w-full sm:w-40" />
        <SelectField value={year} onChange={(e) => setYear(e.target.value)} options={yearOptions} className="w-full sm:w-28" />
      </div>
      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={payslips} loading={loading} emptyTitle="No payslips for this period" emptyDescription="Process a payroll run to generate payslips." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>

      {/* Payslip detail modal */}
      <Modal open={!!viewPayslip} onClose={() => setViewPayslip(null)} title="Payslip">
        {viewPayslip && (
          <div className="space-y-4">
            <div className="flex justify-between text-caption">
              <span className="text-ink-muted48">Employee</span>
              <span className="text-caption-strong">{viewPayslip.employee?.name}</span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-ink-muted48">Pay Date</span>
              <span className="text-caption-strong">{formatDate(viewPayslip.payDate)}</span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-ink-muted48">Basic Salary</span>
              <span>{viewPayslip.basicSalary?.toLocaleString()}</span>
            </div>
            {viewPayslip.breakdown?.length > 0 && (
              <div className="border-t border-divider-soft pt-3 space-y-2">
                {viewPayslip.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-caption">
                    <span className="text-ink-muted80">{b.name}</span>
                    <span className={b.type === "earning" ? "text-success" : "text-danger"}>
                      {b.type === "deduction" ? "−" : "+"}{b.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-divider-soft pt-3 space-y-1">
              <div className="flex justify-between text-caption"><span className="text-ink-muted48">Gross Pay</span><span>{viewPayslip.grossPay?.toLocaleString()}</span></div>
              <div className="flex justify-between text-caption"><span className="text-ink-muted48">Total Deductions</span><span className="text-danger">−{viewPayslip.totalDeductions?.toLocaleString()}</span></div>
              <div className="flex justify-between text-body-strong mt-2"><span>Net Pay</span><span className="text-success">{viewPayslip.netPay?.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
