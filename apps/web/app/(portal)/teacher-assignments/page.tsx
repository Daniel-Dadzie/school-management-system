"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UserCheck } from "lucide-react";
import { toast } from "sonner";

import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useTeacherAssignments,
  useCreateTeacherAssignment,
  useUpdateTeacherAssignmentStatus,
  useSchoolClasses,
  useSubjects,
  useAcademicYears,
  useTerms,
  AssignmentStatus,
} from "@/lib/api/academic";
import { useAuthStore } from "@/stores/auth-store";

const assignmentSchema = z.object({
  teacherId: z.string().uuid("Please enter a valid Teacher UUID"),
  schoolClassId: z.string().min(1, "Please select a school class"),
  subjectId: z.string().min(1, "Please select a subject"),
  academicYearId: z.string().min(1, "Please select an academic year"),
  termId: z.string().min(1, "Please select a term"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export default function TeacherAssignmentsPage() {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === "TEACHER";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: assignments, isLoading, isError, refetch } = useTeacherAssignments(isTeacher);
  const createMutation = useCreateTeacherAssignment();
  const updateStatusMutation = useUpdateTeacherAssignmentStatus();

  // Helper references for select menus
  const { data: classes } = useSchoolClasses();
  const { data: subjects } = useSubjects();
  const { data: academicYears } = useAcademicYears();

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const { data: terms } = useTerms(selectedYearId);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{ id: string; targetStatus: AssignmentStatus } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      await createMutation.mutateAsync({
        teacherId: data.teacherId,
        schoolClassId: data.schoolClassId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        termId: data.termId,
      });
      toast.success("Teacher assigned successfully!");
      setIsAssignOpen(false);
      reset();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to assign teacher");
    }
  };

  const handleStatusChange = async () => {
    if (!statusConfirmItem) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: statusConfirmItem.id,
        status: statusConfirmItem.targetStatus,
      });
      toast.success(`Assignment marked as ${statusConfirmItem.targetStatus.toLowerCase()}`);
      setStatusConfirmItem(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update assignment status");
    }
  };

  // Helper to resolve class name by ID
  const getClassName = (id: string) => classes?.find((c) => c.id === id)?.name || id.slice(0, 8);
  const getSubjectName = (id: string) => subjects?.find((s) => s.id === id)?.name || id.slice(0, 8);

  return (
    <PageShell
      title="Teacher Assignments"
      description={
        isTeacher
          ? "Classes and subjects assigned to you for the active term."
          : "Assign teaching faculty to specific classes, subjects, and terms."
      }
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Teacher Assignments" },
      ]}
      actions={
        isAdmin ? (
          <Button onClick={() => setIsAssignOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Teacher
          </Button>
        ) : undefined
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                {isTeacher ? "My Teaching Schedule" : "All Teacher Assignments"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isTeacher ? "Your authorized classes and subjects" : "Class and subject distribution across all teachers"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingSpinner className="h-6 w-6 text-primary" />
            </div>
          ) : isError ? (
            <EmptyState
              title="Failed to load assignments"
              description="Could not connect to the teacher assignment service."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : !assignments || assignments.length === 0 ? (
            <EmptyState
              title="No assignments found"
              description={
                isTeacher
                  ? "You have not been assigned to any classes or subjects for this term."
                  : "Start by assigning a teacher to a class and subject."
              }
              action={
                isAdmin ? (
                  <Button size="sm" onClick={() => setIsAssignOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Assignment
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-foreground flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span>{item.teacherId.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {getClassName(item.schoolClassId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {getSubjectName(item.subjectId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "ACTIVE" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {item.status === "ACTIVE" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "INACTIVE" })}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:bg-primary/10"
                              onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "ACTIVE" })}
                            >
                              Reactivate
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
            <DialogDescription>
              Assign an instructor to a specific subject, class, and academic term.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher UUID</Label>
              <Input
                id="teacherId"
                placeholder="Enter Teacher UUID"
                {...register("teacherId")}
              />
              {errors.teacherId && (
                <p className="text-xs text-destructive">{errors.teacherId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select onValueChange={(val) => setValue("schoolClassId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.schoolClassId && (
                  <p className="text-xs text-destructive">{errors.schoolClassId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(val) => setValue("subjectId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subjectId && (
                  <p className="text-xs text-destructive">{errors.subjectId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select
                  onValueChange={(val) => {
                    setValue("academicYearId", val);
                    setSelectedYearId(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearId && (
                  <p className="text-xs text-destructive">{errors.academicYearId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  disabled={!selectedYearId}
                  onValueChange={(val) => setValue("termId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedYearId ? "Select Term" : "Pick Year First"} />
                  </SelectTrigger>
                  <SelectContent>
                    {terms?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.termId && (
                  <p className="text-xs text-destructive">{errors.termId.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Assigning..." : "Assign Teacher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!statusConfirmItem}
        onOpenChange={(open) => !open && setStatusConfirmItem(null)}
        title="Update Assignment Status"
        description={`Are you sure you want to mark this assignment as ${statusConfirmItem?.targetStatus.toLowerCase()}?`}
        confirmText="Confirm Update"
        onConfirm={handleStatusChange}
      />
    </PageShell>
  );
}
