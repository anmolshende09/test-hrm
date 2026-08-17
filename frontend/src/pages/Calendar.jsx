import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { calendarService } from "../services/calendarService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CalendarLegend from "../components/calendar/CalendarLegend";
import CalendarEventForm from "../components/calendar/CalendarEventForm";
import EventBar from "../components/calendar/EventBar";
import {
  getMonthGrid,
  getWeekDays,
  isSameDay,
  isWithinRange,
  addMonths,
  addDaysTo,
  monthLabel,
  dayLabel,
  WEEKDAY_LABELS,
} from "../utils/calendarGrid";
import { toInputDate } from "../utils/format";

const VIEW_MODES = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

const MAX_VISIBLE_EVENTS_PER_CELL = 3;

export default function Calendar() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [viewMode, setViewMode] = useState("month");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const today = useMemo(() => new Date(), []);

  // The visible grid always spans full weeks (month view) or a week/day, so
  // we fetch a slightly wider range than the "active" month/day to make sure
  // adjacent-month days shown in the grid still have their events.
  const monthGrid = useMemo(
    () => getMonthGrid(anchorDate.getFullYear(), anchorDate.getMonth()),
    [anchorDate]
  );
  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  const range = useMemo(() => {
    if (viewMode === "month") {
      return { from: monthGrid[0].date, to: monthGrid[monthGrid.length - 1].date };
    }
    if (viewMode === "week") {
      return { from: weekDays[0], to: weekDays[6] };
    }
    return { from: anchorDate, to: anchorDate };
  }, [viewMode, monthGrid, weekDays, anchorDate]);

  const loadEvents = useCallback(() => {
    setLoading(true);
    calendarService
      .list(toInputDate(range.from), toInputDate(range.to))
      .then(({ data }) => setEvents(data.data))
      .catch(() => toast.error("Couldn't load calendar events"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  useEffect(loadEvents, [loadEvents]);

  const eventsForDay = (date) => events.filter((e) => isWithinRange(date, e.startDate, e.endDate));

  const goPrev = () => {
    if (viewMode === "month") setAnchorDate((d) => addMonths(d, -1));
    else if (viewMode === "week") setAnchorDate((d) => addDaysTo(d, -7));
    else setAnchorDate((d) => addDaysTo(d, -1));
  };
  const goNext = () => {
    if (viewMode === "month") setAnchorDate((d) => addMonths(d, 1));
    else if (viewMode === "week") setAnchorDate((d) => addDaysTo(d, 7));
    else setAnchorDate((d) => addDaysTo(d, 1));
  };
  const goToday = () => setAnchorDate(new Date());

  const openAdd = (date) => {
    setEditing(null);
    setDefaultDate(date || anchorDate);
    setModalOpen(true);
  };
  const openEdit = (event) => {
    setEditing(event);
    setDefaultDate(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        await calendarService.update(editing._id, form);
        toast.success("Event updated");
      } else {
        await calendarService.create(form);
        toast.success("Event added");
      }
      closeModal();
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await calendarService.remove(deleteTarget._id);
      toast.success("Event deleted");
      setDeleteTarget(null);
      closeModal();
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete event");
    } finally {
      setDeleting(false);
    }
  };

  const titleLabel =
    viewMode === "day" ? dayLabel(anchorDate) : viewMode === "week" ? `Week of ${monthLabel(weekDays[0])}` : monthLabel(anchorDate);

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Calendar</h1>
          <p className="text-caption text-ink-muted48 mt-1">Track holidays, meetings, and employee leave in one place.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={() => openAdd(anchorDate)}>
            Add Event
          </Button>
        )}
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-lg space-y-4">
        {/* Top bar: navigation + view selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="press-active w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:bg-canvas-parchment"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="press-active w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:bg-canvas-parchment"
            >
              <ChevronRight size={16} />
            </button>
            <Button size="sm" variant="ghost" onClick={goToday}>
              Today
            </Button>
            <p className="text-body-strong ml-1">{titleLabel}</p>
          </div>

          <div className="flex items-center gap-1 bg-canvas-parchment rounded-pill p-1 self-start sm:self-auto">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`press-active px-3.5 py-1.5 rounded-pill text-caption-strong transition-colors ${
                  viewMode === mode.value ? "bg-primary text-white" : "text-ink-muted80 hover:text-ink"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <CalendarLegend />

        {loading ? (
          <LoadingSpinner label="Loading calendar…" />
        ) : viewMode === "month" ? (
          <MonthGrid
            grid={monthGrid}
            today={today}
            eventsForDay={eventsForDay}
            onDayClick={(date) => {
              setAnchorDate(date);
              setViewMode("day");
            }}
            onEventClick={openEdit}
            canManage={canManage}
            onAddOnDay={openAdd}
          />
        ) : viewMode === "week" ? (
          <WeekGrid
            days={weekDays}
            today={today}
            eventsForDay={eventsForDay}
            onDayClick={(date) => {
              setAnchorDate(date);
              setViewMode("day");
            }}
            onEventClick={openEdit}
          />
        ) : (
          <DayAgenda events={eventsForDay(anchorDate)} onEventClick={openEdit} canManage={canManage} />
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Event" : "Add Event"}>
        <CalendarEventForm
          initialValues={editing}
          defaultDate={defaultDate}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          onDelete={editing ? () => setDeleteTarget(editing) : null}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete event?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function MonthGrid({ grid, today, eventsForDay, onDayClick, onEventClick, canManage, onAddOnDay }) {
  return (
    <div className="border border-hairline rounded-md overflow-hidden">
      <div className="grid grid-cols-7 bg-canvas-parchment">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-fine-print text-ink-muted48 font-semibold text-center py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map(({ date, isCurrentMonth }) => {
          const dayEvents = eventsForDay(date);
          const isToday = isSameDay(date, today);
          const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS_PER_CELL);
          const overflow = dayEvents.length - visible.length;

          return (
            <div
              key={date.toISOString()}
              className={`min-h-[92px] border-t border-l border-hairline p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0
                ${isToday ? "bg-warning-soft/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onDayClick(date)}
                  className={`press-active text-caption-strong w-6 h-6 rounded-full flex items-center justify-center
                    ${isToday ? "bg-primary text-white" : isCurrentMonth ? "text-ink hover:bg-canvas-parchment" : "text-ink-muted48/60"}`}
                >
                  {date.getDate()}
                </button>
                {canManage && isCurrentMonth && (
                  <button
                    onClick={() => onAddOnDay(date)}
                    aria-label="Add event"
                    className="press-active opacity-0 hover:opacity-100 focus:opacity-100 w-5 h-5 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {visible.map((event) => (
                  <EventBar key={event._id} event={event} onClick={onEventClick} dense />
                ))}
                {overflow > 0 && (
                  <button
                    onClick={() => onDayClick(date)}
                    className="text-fine-print text-ink-muted48 hover:text-primary px-1.5"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({ days, today, eventsForDay, onDayClick, onEventClick }) {
  return (
    <div className="grid grid-cols-7 border border-hairline rounded-md overflow-hidden">
      {days.map((date) => {
        const dayEvents = eventsForDay(date);
        const isToday = isSameDay(date, today);
        return (
          <div key={date.toISOString()} className={`min-h-[220px] border-l border-hairline first:border-l-0 p-2 ${isToday ? "bg-warning-soft/40" : ""}`}>
            <button
              onClick={() => onDayClick(date)}
              className="press-active block mb-2 text-left"
            >
              <p className="text-fine-print text-ink-muted48">{WEEKDAY_LABELS[date.getDay()]}</p>
              <p className={`text-caption-strong ${isToday ? "text-primary" : "text-ink"}`}>{date.getDate()}</p>
            </button>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <EventBar key={event._id} event={event} onClick={onEventClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayAgenda({ events, onEventClick }) {
  if (events.length === 0) {
    return <p className="text-caption text-ink-muted48 py-8 text-center">No events on this day.</p>;
  }
  return (
    <div className="divide-y divide-divider-soft">
      {events.map((event) => (
        <div key={event._id} className="py-3 first:pt-0">
          <EventBar event={event} onClick={onEventClick} />
          {event.description && <p className="text-caption text-ink-muted48 mt-1.5 pl-1.5">{event.description}</p>}
        </div>
      ))}
    </div>
  );
}
