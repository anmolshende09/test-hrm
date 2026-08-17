require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");


// Route modules
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const branchRoutes = require("./routes/branchRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const designationRoutes = require("./routes/designationRoutes");
const awardTypeRoutes = require("./routes/awardTypeRoutes");
const documentTypeRoutes = require("./routes/documentTypeRoutes");
const documentCategoryRoutes = require("./routes/documentCategoryRoutes");
const hrDocumentRoutes = require("./routes/hrDocumentRoutes");
const contractTypeRoutes = require("./routes/contractTypeRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const attendancePolicyRoutes = require("./routes/attendancePolicyRoutes");
const attendanceRegularizationRoutes = require("./routes/attendanceRegularizationRoutes");
const jobCategoryRoutes = require("./routes/jobCategoryRoutes");
const jobTypeRoutes = require("./routes/jobTypeRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const offerRoutes = require("./routes/offerRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const warningRoutes = require("./routes/warningRoutes");
const resignationRoutes = require("./routes/resignationRoutes");
const terminationRoutes = require("./routes/terminationRoutes");
const salaryComponentRoutes = require("./routes/salaryComponentRoutes");
const employeeSalaryRoutes = require("./routes/employeeSalaryRoutes");
const payrollRunRoutes = require("./routes/payrollRunRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const assetTypeRoutes = require("./routes/assetTypeRoutes");
const assetRoutes = require("./routes/assetRoutes");
const employeeContractRoutes = require("./routes/employeeContractRoutes");
const contractTemplateRoutes = require("./routes/contractTemplateRoutes");
const documentTemplateRoutes = require("./routes/documentTemplateRoutes");
const mediaFolderRoutes = require("./routes/mediaFolderRoutes");
const mediaFileRoutes = require("./routes/mediaFileRoutes");
const trainingTypeRoutes = require("./routes/trainingTypeRoutes");
const trainingProgramRoutes = require("./routes/trainingProgramRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const roleRoutes = require("./routes/roleRoutes");
const employeeTrainingRoutes = require("./routes/employeeTrainingRoutes");
const trainingDashboardRoutes = require("./routes/trainingDashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");


connectDB();

const app = express();

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static file serving for uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HRMS API is running" });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/award-types", awardTypeRoutes);
app.use("/api/document-types", documentTypeRoutes);
app.use("/api/hr-documents", hrDocumentRoutes);
app.use("/api/contract-types", contractTypeRoutes);
app.use("/api/document-categories", documentCategoryRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/attendance-policies", attendancePolicyRoutes);
app.use("/api/attendance-regularizations", attendanceRegularizationRoutes);
app.use("/api/job-categories", jobCategoryRoutes);
app.use("/api/job-types", jobTypeRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/warnings", warningRoutes);
app.use("/api/resignations", resignationRoutes);
app.use("/api/terminations", terminationRoutes);
app.use("/api/salary-components", salaryComponentRoutes);
app.use("/api/employee-salaries", employeeSalaryRoutes);
app.use("/api/payroll-runs", payrollRunRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/asset-types", assetTypeRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employee-contracts", employeeContractRoutes);
app.use("/api/contract-templates", contractTemplateRoutes);
app.use("/api/document-templates", documentTemplateRoutes);
app.use("/api/media-folders", mediaFolderRoutes);
app.use("/api/media-files", mediaFileRoutes);
app.use("/api/training-types", trainingTypeRoutes);
app.use("/api/training-programs", trainingProgramRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/employee-trainings", employeeTrainingRoutes);
app.use("/api/training-dashboard", trainingDashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingsRoutes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HRMS API server listening on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
