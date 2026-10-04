"use client";

import { AdmissionStatus, useAdmissionApplications, AdmissionApplicationResponse } from "@/lib/api/admissions";
import { AdmissionAdapter } from "@/lib/functional/adapters/admission-adapter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, User, Clock } from "lucide-react";

const COLUMNS: { id: AdmissionStatus; title: string; color: string }[] = [
  { id: "PENDING", title: "New Applications", color: "bg-blue-50 dark:bg-blue-900/10 border-blue-200" },
  { id: "UNDER_REVIEW", title: "Under Review", color: "bg-orange-50 dark:bg-orange-900/10 border-orange-200" },
  { id: "INTERVIEW_SCHEDULED", title: "Interview", color: "bg-purple-50 dark:bg-purple-900/10 border-purple-200" },
  { id: "APPROVED", title: "Admitted", color: "bg-green-50 dark:bg-green-900/10 border-green-200" },
  { id: "REJECTED", title: "Rejected", color: "bg-red-50 dark:bg-red-900/10 border-red-200" }
];

export function AdmissionsKanban() {
  const { data: applications, isLoading } = useAdmissionApplications();
  const queryClient = useQueryClient();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdmissionStatus }) => {
      return AdmissionAdapter.updateStatus(id, { status });
    },
    onMutate: async (newUpdate) => {
      await queryClient.cancelQueries({ queryKey: ["admissions"] });
      const previousApps = queryClient.getQueryData<AdmissionApplicationResponse[]>(["admissions"]);
      if (previousApps) {
        queryClient.setQueryData(
          ["admissions"],
          previousApps.map(app => app.id === newUpdate.id ? { ...app, status: newUpdate.status } : app)
        );
      }
      return { previousApps };
    },
    onError: (err, newUpdate, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(["admissions"], context.previousApps);
      }
      toast.error("Failed to update status");
    },
    onSuccess: () => {
      toast.success("Applicant moved successfully");
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const apps = applications || [];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnId: AdmissionStatus) => {
    e.preventDefault();
    if (!draggedId) return;

    const applicant = apps.find(a => a.id.toString() === draggedId);
    if (applicant && applicant.status !== columnId) {
      updateMutation.mutate({ id: draggedId, status: columnId });
    }
    setDraggedId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-14rem)] min-h-[500px] items-start snap-x">
      {COLUMNS.map(col => {
        const columnApps = apps.filter(a => (a.status || "PENDING") === col.id);

        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-80 rounded-xl border flex flex-col h-full snap-start ${col.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-3 border-b bg-background/50 rounded-t-xl font-semibold flex items-center justify-between">
              <span className="text-sm">{col.title}</span>
              <Badge variant="secondary" className="bg-background/80">{columnApps.length}</Badge>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
              {columnApps.length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <span className="text-xs text-muted-foreground">Drop applicant here</span>
                </div>
              ) : (
                columnApps.map(app => (
                  <Card
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id.toString())}
                    onDragEnd={() => setDraggedId(null)}
                    className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border border-border/50 ${draggedId === app.id.toString() ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <CardContent className="p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm leading-tight text-foreground">
                          {app.studentFirstName} {app.studentLastName}
                        </h4>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span>Guardian: {app.parentName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>For: Class {app.applyingForClass}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Applied: {app.createdAt ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(app.createdAt)) : 'Recent'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
