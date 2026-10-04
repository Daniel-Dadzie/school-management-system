"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMonthYear } from "@/lib/format";
import { AuthorizationError, hasPermission, permissions } from "@/lib/authorization/permissions";
import { isMockMode } from "@/lib/functional/config";
import type { CalendarEventRecord, CalendarEventType } from "@/lib/functional/types";
import { useAuthStore } from "@/stores/auth-store";
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent, type CalendarEventInput } from "@/hooks/use-calendar";

const EVENT_TYPES: CalendarEventType[] = ["HOLIDAY", "EXAM", "MEETING", "SPORTS", "CULTURAL", "OTHER"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const typeNames: Record<CalendarEventType, string> = {
  HOLIDAY: "Holiday",
  EXAM: "Examination",
  MEETING: "Meeting",
  SPORTS: "Sports",
  CULTURAL: "Cultural event",
  OTHER: "School event",
};

type EventForm = {
  title: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  description: string;
  location: string;
};

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseDateKey = (value: string) => new Date(`${value}T12:00:00`);
const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1, 12);
const endOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth() + 1, 0, 12);
const addDays = (value: Date, days: number) => new Date(value.getFullYear(), value.getMonth(), value.getDate() + days, 12);
const addMonths = (value: Date, months: number) => new Date(value.getFullYear(), value.getMonth() + months, 1, 12);
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const startsOn = (event: CalendarEventRecord, day: string) => event.startDate <= day && event.endDate >= day;
const blankForm = (day: string): EventForm => ({ title: "", type: "OTHER", startDate: day, endDate: day, allDay: true, description: "", location: "" });
const toForm = (event: CalendarEventRecord): EventForm => ({
  title: event.title,
  type: event.type,
  startDate: event.startDate,
  endDate: event.endDate,
  allDay: event.allDay,
  description: event.description ?? "",
  location: event.location ?? "",
});

export default function CalendarPage() {
  const user = useAuthStore((state) => state.user);
  const canManage = hasPermission(user?.role, permissions.academicsManage);
  const query = useCalendarEvents(user?.tenantId, isMockMode);
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => dateKey(new Date()));
  const [typeFilter, setTypeFilter] = useState<CalendarEventType | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEventRecord | null>(null);
  const [deleting, setDeleting] = useState<CalendarEventRecord | null>(null);
  const [form, setForm] = useState<EventForm>(() => blankForm(dateKey(new Date())));
  const events = query.data ?? [];
  const today = dateKey(new Date());
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -offset);
  const calendarDays = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const selectedEvents = events.filter((event) => startsOn(event, selectedDay) && (typeFilter === "ALL" || event.type === typeFilter));
  const upcomingEvents = events.filter((event) => event.endDate >= today && (typeFilter === "ALL" || event.type === typeFilter)).slice(0, 4);
  const monthEventCount = events.filter((event) => event.startDate <= dateKey(monthEnd) && event.endDate >= dateKey(monthStart) && (typeFilter === "ALL" || event.type === typeFilter)).length;
  const isSaving = createEvent.isPending || updateEvent.isPending;
  const editHasChanges = !editing || JSON.stringify(form) !== JSON.stringify(toForm(editing));

  if (!isMockMode) {
    return <PageShell title="School calendar" permission={permissions.dashboardView}><EmptyState title="Calendar API not connected" description="The school calendar is available in mock mode. Its production API has not been implemented yet." /></PageShell>;
  }

  function openCreate(day = selectedDay) {
    setEditing(null);
    setForm(blankForm(day));
    setDialogOpen(true);
  }

  function openEdit(event: CalendarEventRecord) {
    setEditing(event);
    setForm(toForm(event));
    setDialogOpen(true);
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.endDate < form.startDate) {
      toast.error("The end date must be on or after the start date.");
      return;
    }
    const input: CalendarEventInput = {
      title: form.title.trim(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
      allDay: form.allDay,
    };
    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, patch: input });
        toast.success("Calendar event updated successfully.");
      } else {
        await createEvent.mutateAsync(input);
        toast.success("Calendar event created successfully.");
      }
      setSelectedDay(form.startDate);
      setVisibleMonth(startOfMonth(parseDateKey(form.startDate)));
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the calendar event.");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteEvent.mutateAsync(deleting.id);
      toast.success("Calendar event deleted.");
      setDeleting(null);
    } catch {
      toast.error("Unable to delete the calendar event.");
    }
  }

  if (query.isLoading) {
    return <PageShell title="School calendar" permission={permissions.dashboardView}><div role="status" className="flex justify-center p-12"><LoadingSpinner /></div></PageShell>;
  }

  if (query.isError && query.error instanceof AuthorizationError) {
    return <PageShell title="School calendar"><ForbiddenState /></PageShell>;
  }

  if (query.isError) {
    return <PageShell title="School calendar" permission={permissions.dashboardView}><ErrorState title="Calendar unavailable" description="The school calendar could not be loaded. Try again." onRetry={() => void query.refetch()} /></PageShell>;
  }

  return (
    <PageShell
      title="School calendar"
      description="A school-year view, with each day’s details alongside the month."
      breadcrumbs={[{ label: "School calendar" }]}
      permission={permissions.dashboardView}
      actions={canManage ? <Button onClick={() => openCreate()}><Plus aria-hidden="true" /> Add event</Button> : undefined}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold">{formatMonthYear(visibleMonth)}</p>
              <p className="text-sm text-muted-foreground">{monthEventCount} {monthEventCount === 1 ? "event" : "events"} this month</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setVisibleMonth(startOfMonth(new Date())); setSelectedDay(today); }}>Today</Button>
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}><ChevronLeft aria-hidden="true" /></Button>
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}><ChevronRight aria-hidden="true" /></Button>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CalendarEventType | "ALL")}>
              <SelectTrigger className="w-44" aria-label="Filter calendar by event type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All event types</SelectItem>
                {EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{typeNames[type]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="grid grid-cols-7 border-b pb-2 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const key = dateKey(day);
                  const dayEvents = events.filter((event) => startsOn(event, key) && (typeFilter === "ALL" || event.type === typeFilter));
                  const inMonth = isSameMonth(day, visibleMonth);
                  const selected = key === selectedDay;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${formatDate(key, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}` : ""}`}
                      aria-pressed={selected}
                      onClick={() => setSelectedDay(key)}
                      className={`flex min-h-14 flex-col items-center gap-1 border-b border-r p-1 text-sm transition-colors hover:bg-accent sm:min-h-24 sm:items-start sm:p-2 ${inMonth ? "text-foreground" : "text-muted-foreground"} ${selected ? "bg-accent ring-1 ring-inset ring-primary" : ""}`}
                    >
                      <span className={`flex size-7 items-center justify-center rounded-full ${key === today ? "bg-primary text-primary-foreground" : ""}`}>{day.getDate()}</span>
                      <span className="flex min-h-2 flex-wrap justify-center gap-1 sm:justify-start" aria-hidden="true">
                        {dayEvents.slice(0, 4).map((event) => <span key={event.id} className="size-1.5 rounded-full bg-primary sm:size-2" />)}
                        {dayEvents.length > 4 && <span className="text-xs leading-none">+{dayEvents.length - 4}</span>}
                      </span>
                      <span className="hidden w-full truncate text-left text-xs text-muted-foreground sm:block">
                        {dayEvents[0]?.title ?? ""}{dayEvents.length > 1 ? ` +${dayEvents.length - 1}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <p className="text-sm text-muted-foreground">Day brief</p>
                  <CardTitle className="mt-1 text-lg">{formatDate(selectedDay, { weekday: "long", day: "numeric", month: "long" })}</CardTitle>
                </div>
                {canManage && <Button variant="outline" size="sm" onClick={() => openCreate(selectedDay)}><Plus aria-hidden="true" /> Add</Button>}
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedEvents.length === 0 ? (
                  <EmptyState
                    title={typeFilter !== "ALL" ? `No ${typeNames[typeFilter].toLowerCase()} events on this day` : events.length === 0 ? "No school dates yet" : "No events on this day"}
                    description={typeFilter !== "ALL" ? "Choose another date or show all event types." : events.length === 0 ? "Add key school dates so staff and families can see the year at a glance." : "The day is clear. Choose another date or add a school event."}
                    action={canManage && events.length === 0 ? <Button variant="outline" onClick={() => openCreate(selectedDay)}>Add the first event</Button> : undefined}
                    className="min-h-40 border-0 p-4"
                  />
                ) : selectedEvents.map((event) => (
                  <article key={event.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{event.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{typeNames[event.type]} · {event.startDate === event.endDate ? formatDate(event.startDate) : `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`}</p>
                      </div>
                      {canManage && <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${event.title}`} onClick={() => openEdit(event)}><Pencil aria-hidden="true" /></Button>
                        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${event.title}`} onClick={() => setDeleting(event)}><Trash2 aria-hidden="true" /></Button>
                      </div>}
                    </div>
                    {event.location && <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{event.location}</p>}
                    {event.description && <p className="mt-2 text-sm">{event.description}</p>}
                  </article>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Coming up</CardTitle></CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events match this filter.</p>
                ) : (
                  <ol className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <li key={event.id}>
                        <button type="button" onClick={() => { setSelectedDay(event.startDate); setVisibleMonth(startOfMonth(parseDateKey(event.startDate))); }} className="flex w-full items-start gap-3 rounded-md text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <span className="min-w-12 rounded-md border px-2 py-1 text-center text-xs font-semibold">{formatDate(event.startDate, { day: "numeric", month: "short" })}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{event.title}</span>
                            <span className="block text-xs text-muted-foreground">{typeNames[event.type]}{event.location ? ` · ${event.location}` : ""}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Prototype calendar · events are saved in this browser and are not yet shared through the school API.</p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit school event" : "Add school event"}</DialogTitle>
            <DialogDescription>Record key school dates in this calendar prototype.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void submitEvent(event)}>
            <div className="space-y-2">
              <Label htmlFor="calendar-title">Event name</Label>
              <Input id="calendar-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-type">Event type</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as CalendarEventType })}>
                <SelectTrigger id="calendar-type"><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{typeNames[type]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="calendar-start">Starts</Label><Input id="calendar-start" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value, endDate: form.endDate < event.target.value ? event.target.value : form.endDate })} required /></div>
              <div className="space-y-2"><Label htmlFor="calendar-end">Ends</Label><Input id="calendar-end" type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required /></div>
            </div>
            <div className="flex min-h-11 items-center gap-2"><input id="calendar-all-day" type="checkbox" checked={form.allDay} onChange={(event) => setForm({ ...form, allDay: event.target.checked })} className="size-4 rounded border-input accent-primary" /><Label htmlFor="calendar-all-day">All day</Label></div>
            <div className="space-y-2"><Label htmlFor="calendar-location">Location <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="calendar-location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} maxLength={120} /></div>
            <div className="space-y-2"><Label htmlFor="calendar-description">Details <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="calendar-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} rows={3} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving || !form.title.trim() || !editHasChanges}>{isSaving ? "Saving..." : editing ? "Save changes" : "Add event"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        title="Delete this event?"
        description={deleting ? `“${deleting.title}” will be removed from the mock calendar.` : "This event will be removed from the mock calendar."}
        confirmText={deleteEvent.isPending ? "Deleting..." : "Delete event"}
        destructive
        confirmDisabled={deleteEvent.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </PageShell>
  );
}
