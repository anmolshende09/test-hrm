import React, { useEffect, useState } from "react";
import { GraduationCap, CheckCircle2, Clock, UserPlus, XCircle } from "lucide-react";
import { trainingDashboardService } from "../services/trainingDashboardService";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/format";

const STAT_CARDS = [
  { key: "total", label: "Total Trainings", icon: GraduationCap, color: "text-primary bg-primary/10" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-success bg-success-soft", suffix: (d) => ` (${d.completedRate}%)` },
  { key: "inProgress", label: "In-progress", icon: Clock, color: "text-warning bg-warning-soft" },
  { key: "enrolled", label: "Enrolled", icon: UserPlus, color: "text-ink-muted80 bg-canvas-parchment" },
  { key: "failed", label: "Failed", icon: XCircle, color: "text-danger bg-danger-soft" },
];

export default function TrainingDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainingDashboardService
      .get()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error("Couldn't load training dashboard"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSpinner label="Loading training dashboard…" />;
  if (!data) return null;

  const { stats, programCompletionRates, recentCompletions, upcomingTrainings } = data;

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="text-display-md">Training Dashboard</h1>
        <p className="text-caption text-ink-muted48 mt-1">Overview of training activity across your organization.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="bg-canvas border border-hairline rounded-lg p-lg">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={16} />
            </div>
            <p className="text-display-sm">
              {stats[card.key]}
              {card.suffix && <span className="text-caption text-ink-muted48">{card.suffix(stats)}</span>}
            </p>
            <p className="text-caption text-ink-muted48 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <h2 className="text-body-strong mb-3">Program Completion Rates</h2>
          {programCompletionRates.length === 0 ? (
            <p className="text-caption text-ink-muted48">No training programs with enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {programCompletionRates.map((p) => (
                <div key={p.trainingProgram}>
                  <div className="flex items-center justify-between text-caption mb-1">
                    <span className="text-caption-strong">{p.programName}</span>
                    <span className="text-ink-muted48">
                      {p.completed}/{p.total} ({p.rate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-pill bg-canvas-parchment overflow-hidden">
                    <div className="h-full bg-primary rounded-pill" style={{ width: `${p.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-lg">
          <h2 className="text-body-strong mb-3">Recent Completions</h2>
          {recentCompletions.length === 0 ? (
            <p className="text-caption text-ink-muted48">No completions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((t) => (
                <div key={t._id} className="flex items-center justify-between text-caption">
                  <div>
                    <p className="text-caption-strong">{t.employee?.name}</p>
                    <p className="text-fine-print text-ink-muted48">{t.trainingProgram?.name}</p>
                  </div>
                  <div className="text-right">
                    {t.score != null && (
                      <p className={`text-caption-strong ${t.result === "failed" ? "text-danger" : "text-success"}`}>
                        {t.score}% {t.result === "passed" ? "— Passed" : t.result === "failed" ? "— Failed" : ""}
                      </p>
                    )}
                    <p className="text-fine-print text-ink-muted48">{formatDate(t.completionDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg">
        <h2 className="text-body-strong mb-3">Upcoming Trainings</h2>
        {upcomingTrainings.length === 0 ? (
          <p className="text-caption text-ink-muted48">No upcoming trainings.</p>
        ) : (
          <div className="space-y-2">
            {upcomingTrainings.map((t) => (
              <div key={t._id} className="flex items-center justify-between text-caption px-3 py-2 rounded-sm bg-canvas-parchment">
                <div>
                  <span className="text-caption-strong">{t.employee?.name}</span>
                  <span className="text-ink-muted48"> — {t.trainingProgram?.name}</span>
                </div>
                <span className="text-fine-print text-ink-muted48">Assigned: {formatDate(t.assignedDate)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
