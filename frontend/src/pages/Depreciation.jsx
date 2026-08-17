import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { assetService } from "../services/assetService";
import { assetTypeService } from "../services/assetTypeService";
import { useToast } from "../context/ToastContext";
import { downloadBlob } from "../utils/download";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import StatCard from "../components/common/StatCard";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import { SelectField } from "../components/common/FormField";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/format";
import { TrendingDown, DollarSign, BarChart2 } from "lucide-react";

export default function Depreciation() {
  const toast = useToast();
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [assetTypes, setAssetTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [typeFilter, setTypeFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    assetTypeService.list({ limit: 100 }).then(({ data }) => setAssetTypes(data.data)).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    assetService.depreciation({ search: debouncedSearch || undefined, assetType: typeFilter || undefined, page, limit: 10 })
      .then(({ data }) => {
        setAssets(data.data);
        setSummary(data.summary);
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      })
      .catch(() => toast.error("Couldn't load depreciation report"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [debouncedSearch, typeFilter]); // eslint-disable-line

  const handleExport = async () => {
    setExporting(true);
    try { const { data } = await assetService.exportDepreciation(); downloadBlob(data, "depreciation-report.csv"); }
    catch { toast.error("Couldn't export"); }
    finally { setExporting(false); }
  };

  const columns = [
    { key: "name", header: "Asset", render: (r) => <div><p className="text-caption-strong">{r.name}</p><p className="text-fine-print text-ink-muted48">{r.assetCode}</p></div> },
    { key: "assetType", header: "Type", render: (r) => r.assetType?.name || "—" },
    { key: "purchaseDate", header: "Purchase Date", render: (r) => formatDate(r.purchaseDate) },
    { key: "purchaseCost", header: "Purchase Cost", render: (r) => r.purchaseCost?.toLocaleString() || "—" },
    { key: "usefulLifeYears", header: "Life (yrs)" },
    { key: "salvageValue", header: "Salvage Value", render: (r) => r.salvageValue?.toLocaleString() },
    { key: "depreciationAmount", header: "Depreciated", render: (r) => <span className="text-danger">{r.depreciationAmount?.toLocaleString()}</span> },
    { key: "depreciationPct", header: "%", render: (r) => `${r.depreciationPct}%` },
    { key: "currentValue", header: "Current Value", render: (r) => <span className="text-caption-strong text-success">{r.currentValue?.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-display-md">Depreciation</h1><p className="text-caption text-ink-muted48 mt-1">Straight-line depreciation report for all depreciable assets.</p></div>
        <Button variant="secondary" icon={Download} onClick={handleExport} loading={exporting}>Export CSV</Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard title="Total Purchase Value" count={summary.totalPurchaseValue?.toLocaleString()} icon={DollarSign} theme="blue" />
          <StatCard title="Total Depreciation" count={summary.totalDepreciation?.toLocaleString()} icon={TrendingDown} theme="red" />
          <StatCard title="Current Value" count={summary.totalCurrentValue?.toLocaleString()} icon={DollarSign} theme="green" />
          <StatCard title="Avg Depreciation" count={`${summary.depreciationPct}%`} icon={BarChart2} theme="amber" />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or code…" className="max-w-sm" />
        <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: "", label: "All Types" }, ...assetTypes.map((t) => ({ value: t._id, label: t.name }))]} className="w-44" />
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <Table columns={columns} data={assets} loading={loading} emptyTitle="No depreciable assets" emptyDescription="Assets using straight-line depreciation will appear here." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
    </div>
  );
}
