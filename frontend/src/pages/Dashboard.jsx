import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, UserX, CalendarClock, RotateCw, Wallet, Percent, Building2, Hourglass, ChevronRight } from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DepartmentDistribution from "../components/dashboard/DepartmentDistribution";
import EmployeesOnLeave from "../components/dashboard/EmployeesOnLeave";
import RecentLeaveRequests from "../components/dashboard/RecentLeaveRequests";
import AnnouncementsWidget from "../components/dashboard/AnnouncementsWidget";
import QuickActions from "../components/dashboard/QuickActions";
import AssetStatusChart from "../components/dashboard/AssetStatusChart";
import CandidatePipelineChart from "../components/dashboard/CandidatePipelineChart";
import HiringTrendChart from "../components/dashboard/HiringTrendChart";
import PayrollTrendChart from "../components/dashboard/PayrollTrendChart";
import TodaysBirthdaysWidget from "../components/dashboard/TodaysBirthdaysWidget";
import RecentCandidatesWidget from "../components/dashboard/RecentCandidatesWidget";
import LeaveOverviewChart from "../components/dashboard/LeaveOverviewChart";
import AttendanceLast7DaysChart from "../components/dashboard/AttendanceLast7DaysChart";
import { formatCurrency } from "../utils/format";

function WidgetCard({ title, viewAllTo, children }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-strong">{title}</h3>
        {viewAllTo && (
          <Link to={viewAllTo} className="flex items-center gap-0.5 text-caption text-primary hover:underline">
            View all <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const canManage = MANAGER_ROLES.includes(user?.role);

  const load = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    dashboardService
      .getDashboard()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error("Couldn't load dashboard data"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => load(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSpinner full label="Loading dashboard…" />;

  const cards = data?.cards || {};

  return (
    <div className="space-y-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-md">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-caption text-ink-muted48 mt-1">Here's what's happening across your organization today.</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="press-active flex items-center gap-2 px-3.5 h-9 rounded-pill border border-hairline text-caption-strong text-ink-muted80 hover:bg-canvas-parchment shrink-0"
        >
          <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <QuickActions canManage={canManage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" count={cards.totalEmployees ?? 0} icon={Users} theme="blue" />
        <StatCard title="Present Today" count={cards.presentToday ?? 0} icon={UserCheck} theme="green" />
        <StatCard title="Absent Today" count={cards.absentToday ?? 0} icon={UserX} theme="red" />
        <StatCard title="On Leave" count={cards.onLeaveToday ?? 0} icon={CalendarClock} theme="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Payroll This Month"
          count={formatCurrency(cards.payrollThisMonth?.netPay ?? 0)}
          icon={Wallet}
          theme="blue"
        />
        <StatCard title="Attendance Rate" count={`${cards.attendanceRate ?? 0}%`} icon={Percent} theme="green" />
        <StatCard title="Branches" count={cards.branchesCount ?? 0} icon={Building2} theme="amber" />
        <StatCard title="Pending Leaves" count={cards.pendingLeavesCount ?? 0} icon={Hourglass} theme="red" />
      </div>
      <p className="text-fine-print text-ink-muted48 -mt-3">
        Payroll This Month reflects completed runs only ({cards.payrollThisMonth?.runsCompleted ?? 0} this month) • Attendance Rate is month-to-date, present ÷ (present + absent)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <WidgetCard title="Today's Birthdays">
          <TodaysBirthdaysWidget items={data?.todaysBirthdays} />
        </WidgetCard>
        <WidgetCard title="Employees on Leave Today">
          <EmployeesOnLeave items={data?.employeesOnLeave} />
        </WidgetCard>
        <WidgetCard title="Attendance — Last 7 Days">
          <AttendanceLast7DaysChart data={data?.attendanceLast7Days} />
        </WidgetCard>
        <WidgetCard title="Leave Overview">
          <LeaveOverviewChart data={data?.leaveOverview} total={data?.leaveOverviewTotal} />
        </WidgetCard>
        <WidgetCard title="Recent Leave Applications" viewAllTo="/leaves">
          <RecentLeaveRequests items={data?.recentLeaveRequests} />
        </WidgetCard>
        <WidgetCard title="Recent Candidates" viewAllTo="/candidates">
          <RecentCandidatesWidget items={data?.recentCandidates} />
        </WidgetCard>
        <WidgetCard title="Announcements" viewAllTo="/announcements">
          <AnnouncementsWidget items={data?.announcements} />
        </WidgetCard>
        <WidgetCard title="Department Distribution">
          <DepartmentDistribution departments={data?.departmentDistribution} />
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <WidgetCard title="Hiring Trend">
          <HiringTrendChart />
        </WidgetCard>
        <WidgetCard title="Payroll Trend">
          <PayrollTrendChart />
        </WidgetCard>
        <WidgetCard title="Asset Status">
          <AssetStatusChart data={data?.assetStatusDistribution} />
        </WidgetCard>
        <WidgetCard title="Candidate Pipeline">
          <CandidatePipelineChart data={data?.candidatePipeline} rejectedCount={data?.candidateRejectedCount} />
        </WidgetCard>
      </div>
    </div>
  );
}
