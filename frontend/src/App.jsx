import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import OrgChart from "./pages/OrgChart";
import Branches from "./pages/Branches";
import Holidays from "./pages/Holidays";
import Designations from "./pages/Designations";
import AwardTypes from "./pages/AwardTypes";
import DocumentTypes from "./pages/DocumentTypes";
import ContractTypes from "./pages/ContractTypes";
import DocumentCategories from "./pages/DocumentCategories";
import HRDocuments from "./pages/HRDocuments";
import Shifts from "./pages/Shifts";
import AttendancePolicies from "./pages/AttendancePolicies";
import AttendanceRegularizations from "./pages/AttendanceRegularizations";
import JobCategories from "./pages/JobCategories";
import JobTypes from "./pages/JobTypes";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Offers from "./pages/Offers";
import Promotions from "./pages/Promotions";
import Warnings from "./pages/Warnings";
import Resignations from "./pages/Resignations";
import Terminations from "./pages/Terminations";
import SalaryComponents from "./pages/SalaryComponents";
import EmployeeSalaries from "./pages/EmployeeSalaries";
import PayrollRuns from "./pages/PayrollRuns";
import Payslips from "./pages/Payslips";
import AssetDashboard from "./pages/AssetDashboard";
import Assets from "./pages/Assets";
import Depreciation from "./pages/Depreciation";
import AssetTypes from "./pages/AssetTypes";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import EmployeeContracts from "./pages/EmployeeContracts";
import ContractTemplates from "./pages/ContractTemplates";
import DocumentTemplates from "./pages/DocumentTemplates";
import Announcements from "./pages/Announcements";
import TrainingTypes from "./pages/TrainingTypes";
import Currencies from "./pages/Currencies";
import EmployeeTrainings from "./pages/EmployeeTrainings";
import TrainingDashboard from "./pages/TrainingDashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import AddRole from "./pages/AddRole";
import SettingsLayout from "./layouts/SettingsLayout";
import SystemSettings from "./pages/settings/SystemSettings";
import BrandSettings from "./pages/settings/BrandSettings";
import EmailSettings from "./pages/settings/EmailSettings";
import WorkingDaysSettings from "./pages/settings/WorkingDaysSettings";
import StorageSettings from "./pages/settings/StorageSettings";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import MediaLibrary from "./pages/MediaLibrary";
import TrainingPrograms from "./pages/TrainingPrograms";

import { MANAGER_ROLES } from "./constants/roles";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/org-chart" element={<OrgChart />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance-regularizations" element={<AttendanceRegularizations />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/announcements" element={<Announcements />} />

          <Route element={<ProtectedRoute roles={MANAGER_ROLES} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/holidays" element={<Holidays />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/award-types" element={<AwardTypes />} />
            <Route path="/document-types" element={<DocumentTypes />} />
            <Route path="/contract-types" element={<ContractTypes />} />
            <Route path="/document-categories" element={<DocumentCategories />} />
            <Route path="/documents" element={<HRDocuments />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/attendance-policies" element={<AttendancePolicies />} />
            <Route path="/job-categories" element={<JobCategories />} />
            <Route path="/job-types" element={<JobTypes />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/warnings" element={<Warnings />} />
            <Route path="/resignations" element={<Resignations />} />
            <Route path="/terminations" element={<Terminations />} />
            <Route path="/salary-components" element={<SalaryComponents />} />
            <Route path="/employee-salaries" element={<EmployeeSalaries />} />
            <Route path="/payroll-runs" element={<PayrollRuns />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/asset-dashboard" element={<AssetDashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/depreciation" element={<Depreciation />} />
            <Route path="/asset-types" element={<AssetTypes />} />
            <Route path="/employee-contracts" element={<EmployeeContracts />} />
            <Route path="/contract-templates" element={<ContractTemplates />} />
            <Route path="/document-templates" element={<DocumentTemplates />} />
            <Route path="/media-library" element={<MediaLibrary />} />
            <Route path="/training-types" element={<TrainingTypes />} />
            <Route path="/training-programs" element={<TrainingPrograms />} />
            <Route path="/currencies" element={<Currencies />} />
            <Route path="/employee-trainings" element={<EmployeeTrainings />} />
            <Route path="/training-dashboard" element={<TrainingDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/roles/new" element={<AddRole />} />
            <Route path="/roles/:id/edit" element={<AddRole />} />
            <Route path="/settings" element={<SettingsLayout />}>
            <Route path="system" element={<SystemSettings />} />
            <Route path="brand" element={<BrandSettings />} />
            <Route path="email" element={<EmailSettings />} />
            <Route path="working-days" element={<WorkingDaysSettings />} />
            <Route path="storage" element={<StorageSettings />} />
          </Route>
            
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
