const Asset = require("../models/Asset");
const asyncHandler = require("../utils/asyncHandler");
const { toCSV, parseCSV } = require("../utils/csv");

// Straight-line depreciation: (cost - salvage) / usefulLife years elapsed
const computeCurrentValue = (asset) => {
  if (asset.depreciationMethod === "none" || !asset.purchaseDate || !asset.purchaseCost) {
    return { currentValue: asset.purchaseCost || 0, depreciationAmount: 0, depreciationPct: 0 };
  }
  const yearsElapsed = (Date.now() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
  const depreciableAmount = asset.purchaseCost - (asset.salvageValue || 0);
  const annualDepreciation = depreciableAmount / (asset.usefulLifeYears || 1);
  const depreciationAmount = Math.min(depreciableAmount, annualDepreciation * yearsElapsed);
  const currentValue = Math.max(asset.salvageValue || 0, asset.purchaseCost - depreciationAmount);
  const depreciationPct = asset.purchaseCost > 0 ? Math.round((depreciationAmount / asset.purchaseCost) * 100) : 0;
  return { currentValue: Math.round(currentValue), depreciationAmount: Math.round(depreciationAmount), depreciationPct };
};

const createAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.create({ ...req.body, createdBy: req.user._id });
  await asset.populate([{ path: "assetType", select: "name" }, { path: "assignedTo", select: "name employeeId" }]);
  res.status(201).json({ success: true, data: { ...asset.toObject(), ...computeCurrentValue(asset) } });
});

const getAssets = asyncHandler(async (req, res) => {
  const { search, status, assetType, page = 1, limit = 10 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (assetType) query.assetType = assetType;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate("assetType", "name")
      .populate("assignedTo", "name employeeId")
      .sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Asset.countDocuments(query),
  ]);

  res.json({ success: true, data: assets.map((a) => ({ ...a.toObject(), ...computeCurrentValue(a) })), pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).populate("assetType", "name").populate("assignedTo", "name employeeId");
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, data: { ...asset.toObject(), ...computeCurrentValue(asset) } });
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("assetType", "name").populate("assignedTo", "name employeeId");
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, data: { ...asset.toObject(), ...computeCurrentValue(asset) } });
});

const assignAsset = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  const asset = await Asset.findByIdAndUpdate(req.params.id, { assignedTo: employeeId, assignedDate: new Date(), status: "assigned" }, { new: true })
    .populate("assetType", "name").populate("assignedTo", "name employeeId");
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, data: asset });
});

const returnAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, { assignedTo: null, assignedDate: null, status: "available" }, { new: true })
    .populate("assetType", "name");
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, data: asset });
});

const scheduleMaintenance = asyncHandler(async (req, res) => {
  const { scheduledDate, description } = req.body;
  const asset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $push: { maintenanceSchedule: { scheduledDate, description, status: "scheduled" } }, status: "under_maintenance" },
    { new: true }
  ).populate("assetType", "name");
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, data: asset });
});

const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
  res.json({ success: true, message: "Asset deleted" });
});

const exportAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find().populate("assetType", "name").populate("assignedTo", "name employeeId").sort({ createdAt: -1 });
  const csv = toCSV(assets, [
    { label: "Asset Code", value: (r) => r.assetCode },
    { label: "Name", value: (r) => r.name },
    { label: "Type", value: (r) => r.assetType?.name || "" },
    { label: "Status", value: (r) => r.status },
    { label: "Assigned To", value: (r) => r.assignedTo?.name || "" },
    { label: "Purchase Date", value: (r) => r.purchaseDate?.toISOString().split("T")[0] || "" },
    { label: "Purchase Cost", value: (r) => r.purchaseCost || 0 },
    { label: "Location", value: (r) => r.location },
  ]);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="assets.csv"');
  res.send(csv);
});

// Dashboard aggregation
const getAssetDashboard = asyncHandler(async (req, res) => {
  const [statusCounts, assetTypes, allAssets] = await Promise.all([
    Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Asset.aggregate([{ $group: { _id: "$assetType", count: { $sum: 1 } } }]),
    Asset.find().populate("assetType", "name").populate("assignedTo", "name"),
  ]);

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
  const totalAssets = allAssets.length;

  let totalPurchaseValue = 0, totalCurrentValue = 0, totalDepreciation = 0;
  allAssets.forEach((a) => {
    const { currentValue, depreciationAmount } = computeCurrentValue(a);
    totalPurchaseValue += a.purchaseCost || 0;
    totalCurrentValue += currentValue;
    totalDepreciation += depreciationAmount;
  });

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const recentAssignments = allAssets.filter((a) => a.assignedTo && a.assignedDate).sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)).slice(0, 5);
  const upcomingMaintenance = allAssets.flatMap((a) => (a.maintenanceSchedule || []).filter((m) => m.status === "scheduled" && new Date(m.scheduledDate) >= today).map((m) => ({ asset: a.name, scheduledDate: m.scheduledDate, description: m.description }))).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)).slice(0, 5);
  const expiringWarranties = allAssets.filter((a) => a.warrantyExpiry && new Date(a.warrantyExpiry) <= in30Days && new Date(a.warrantyExpiry) >= today).sort((a, b) => new Date(a.warrantyExpiry) - new Date(b.warrantyExpiry)).slice(0, 5);

  res.json({
    success: true,
    data: {
      totalAssets,
      available: statusMap.available || 0,
      assigned: statusMap.assigned || 0,
      underMaintenance: statusMap.under_maintenance || 0,
      totalPurchaseValue, totalCurrentValue, totalDepreciation,
      depreciationPct: totalPurchaseValue > 0 ? Math.round((totalDepreciation / totalPurchaseValue) * 100) : 0,
      recentAssignments: recentAssignments.map((a) => ({ _id: a._id, name: a.name, assignedTo: a.assignedTo?.name, assignedDate: a.assignedDate })),
      upcomingMaintenance,
      expiringWarranties: expiringWarranties.map((a) => ({ _id: a._id, name: a.name, warrantyExpiry: a.warrantyExpiry })),
    },
  });
});

// Depreciation report
const getDepreciationReport = asyncHandler(async (req, res) => {
  const { search, assetType, page = 1, limit = 10 } = req.query;
  const query = { depreciationMethod: "straight_line" };
  if (assetType) query.assetType = assetType;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const assets = await Asset.find(query).populate("assetType", "name").sort({ purchaseDate: -1 });
  const filtered = search ? assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.assetCode.toLowerCase().includes(search.toLowerCase())) : assets;

  const withDepreciation = filtered.map((a) => ({ ...a.toObject(), ...computeCurrentValue(a) }));
  const totalPurchaseValue = withDepreciation.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const totalCurrentValue = withDepreciation.reduce((sum, a) => sum + a.currentValue, 0);
  const totalDepreciation = withDepreciation.reduce((sum, a) => sum + a.depreciationAmount, 0);

  const paged = withDepreciation.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paged,
    summary: { totalPurchaseValue, totalCurrentValue, totalDepreciation, depreciationPct: totalPurchaseValue > 0 ? Math.round((totalDepreciation / totalPurchaseValue) * 100) : 0 },
    pagination: { total: filtered.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(filtered.length / limitNum) },
  });
});

const exportDepreciation = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ depreciationMethod: "straight_line" }).populate("assetType", "name");
  const withDepreciation = assets.map((a) => ({ ...a.toObject(), ...computeCurrentValue(a) }));

  const csv = toCSV(withDepreciation, [
    { label: "Asset Code", value: (r) => r.assetCode },
    { label: "Name", value: (r) => r.name },
    { label: "Type", value: (r) => r.assetType?.name || "" },
    { label: "Purchase Date", value: (r) => r.purchaseDate?.toISOString?.().split("T")[0] || "" },
    { label: "Purchase Cost", value: (r) => r.purchaseCost || 0 },
    { label: "Depreciation Method", value: (r) => r.depreciationMethod },
    { label: "Current Value", value: (r) => r.currentValue },
    { label: "Depreciation Amount", value: (r) => r.depreciationAmount },
    { label: "Depreciation %", value: (r) => r.depreciationPct },
  ]);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="depreciation-report.csv"');
  res.send(csv);
});

module.exports = { createAsset, getAssets, getAsset, updateAsset, assignAsset, returnAsset, scheduleMaintenance, deleteAsset, exportAssets, getAssetDashboard, getDepreciationReport, exportDepreciation };
