"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UserPlus, ClipboardList } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useEnrollments,
  useCreateEnrollment,
  useUpdateEnrollmentStatus,
  useSchoolClasses,
  useAcademicYears,
  EnrollmentStatus,
} from "@/lib/api/academic";
import { useAuthStore } from "@/stores/auth-store";

const enrollmentSchema = z.object({
  studentId: z.string().uuid("Please provide a valid Student UUID"),
  schoolClassId: z.string().min(1, "Please select a school class"),
  academicYearId: z.string().min(1, "Please select an academic year"),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function EnrollmentsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: enrollments, isLoading, isError, refetch } = useEnrollments();
  const createEnrollmentMutation = useCreateEnrollment();
  const updateStatusMutation = useUpdateEnrollmentStatus();

  const { data: classes } = useSchoolClasses();
  const { data: academicYears } = useAcademicYears();

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{ id: string; targetStatus: EnrollmentStatus } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      await createEnrollmentMutation.mutateAsync({
        studentId: data.studentId,
        schoolClassId: data.schoolClassId,
        academicYearId: data.academicYearId,
      });
      toast.success("Student enrolled successfully!");
      setIsEnrollOpen(false);
      reset();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to enroll student");
    }
  };

  const handleStatusChange = async () => {
    if (!statusConfirmItem) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: statusConfirmItem.id,
        status: statusConfirmItem.targetStatus,
      });
      toast.success(`Enrollment marked as ${statusConfirmItem.targetStatus.toLowerCase()}`);
      setStatusConfirmItem(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update enrollment status");
    }
  };

  const getClassName = (id: string) => classes?.find((c) => c.id === id)?.name || id.slice(0, 8);
  const getYearName = (id: string) => academicYears?.find((y) => y.id === id)?.name || id.slice(0, 8);

  const getBadgeVariant = (status: EnrollmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "SUSPENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <PageShell
      title="Student Enrollments"
      description="Manage class rosters, student enrollments, and academic year placements."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Enrollments" },
      ]}
      allowedRoles={["SUPER_ADMIN", "ADMIN"]}
      actions={
        isAdmin ? (
          <Button onClick={() => setIsEnrollOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Enroll Student
          </Button>
        ) : undefined
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Class Enrollments</CardTitle>
              <CardDescription className="text-xs">
                Students currently assigned to academic classes and terms
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
              title="Failed to load enrollments"
              description="Could not connect to the academic enrollment service."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : !enrollments || enrollments.length === 0 ? (
            <EmptyState
              title="No enrollments recorded"
              description="Start by enrolling registered students into an academic class."
              action={
                isAdmin ? (
                  <Button size="sm" onClick={() => setIsEnrollOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Enroll First Student
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-foreground flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-primary" />
                        <span>{item.studentId.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {getClassName(item.schoolClassId)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {getYearName(item.academicYearId)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.enrolledAt ? item.enrolledAt.split("T")[0] : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getBadgeVariant(item.status)}
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Update Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Set Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {item.status !== "ACTIVE" && (
                                <DropdownMenuItem
                                  onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "ACTIVE" })}
                                >
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {item.status !== "SUSPENDED" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "SUSPENDED" })}
                                >
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {item.status !== "TRANSFERRED" && (
                                <DropdownMenuItem
                                  onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "TRANSFERRED" })}
                                >
                                  Transfer Out
                                </DropdownMenuItem>
                              )}
                              {item.status !== "WITHDRAWN" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setStatusConfirmItem({ id: item.id, targetStatus: "WITHDRAWN" })}
                                >
                                  Withdraw
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Enroll Student Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student in Class</DialogTitle>
            <DialogDescription>
              Assign a registered student into a specific class and academic year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student UUID</Label>
              <Input
                id="studentId"
                placeholder="Enter Student UUID"
                {...register("studentId")}
              />
              {errors.studentId && (
                <p className="text-xs text-destructive">{errors.studentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>School Class</Label>
              <Select onValueChange={(val) => setValue("schoolClassId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.schoolClassId && (
                <p className="text-xs text-destructive">{errors.schoolClassId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select onValueChange={(val) => setValue("academicYearId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Academic Year" />
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEnrollOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEnrollmentMutation.isPending}>
                {createEnrollmentMutation.isPending ? "Enrolling..." : "Enroll Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!statusConfirmItem}
        onOpenChange={(open) => !open && setStatusConfirmItem(null)}
        title="Update Enrollment Status"
        description={`Are you sure you want to change this student's enrollment status to ${statusConfirmItem?.targetStatus.toLowerCase()}?`}
        confirmText="Confirm Change"
        destructive={statusConfirmItem?.targetStatus === "SUSPENDED" || statusConfirmItem?.targetStatus === "WITHDRAWN"}
        onConfirm={handleStatusChange}
      />
    </PageShell>
  );
}
