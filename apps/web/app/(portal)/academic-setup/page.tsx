"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAcademicYears,
  useCreateAcademicYear,
  useTerms,
  useCreateTerm,
  AcademicYearResponse,
} from "@/lib/api/academic";
import { useAuthStore } from "@/stores/auth-store";

const academicYearSchema = z.object({
  name: z.string().min(1, "Academic year name is required (e.g. 2026/2027)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

const termSchema = z.object({
  name: z.string().min(1, "Term name is required (e.g. Term 1)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isMandatory: z.boolean(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TermFormData = z.infer<typeof termSchema>;

export default function AcademicsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: academicYears, isLoading, isError, refetch } = useAcademicYears();
  const createYearMutation = useCreateAcademicYear();

  const [selectedYear, setSelectedYear] = useState<AcademicYearResponse | null>(null);
  const [isCreateYearOpen, setIsCreateYearOpen] = useState(false);
  const [isCreateTermOpen, setIsCreateTermOpen] = useState(false);

  // Default selection to first active year if none selected
  const currentSelectedYear = selectedYear || (academicYears && academicYears.length > 0 ? academicYears[0] : null);

  const { data: terms, isLoading: isTermsLoading } = useTerms(currentSelectedYear?.id);
  const createTermMutation = useCreateTerm(currentSelectedYear?.id || "");

  // Year Form
  const {
    register: registerYear,
    handleSubmit: handleSubmitYear,
    formState: { errors: yearErrors },
    reset: resetYearForm,
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
  });

  // Term Form
  const {
    register: registerTerm,
    handleSubmit: handleSubmitTerm,
    setValue: setTermValue,
    watch: watchTerm,
    formState: { errors: termErrors },
    reset: resetTermForm,
  } = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      isMandatory: true,
    },
  });

  const onSubmitYear = async (data: AcademicYearFormData) => {
    try {
      await createYearMutation.mutateAsync(data);
      toast.success("Academic year created successfully!");
      setIsCreateYearOpen(false);
      resetYearForm();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create academic year");
    }
  };

  const onSubmitTerm = async (data: TermFormData) => {
    if (!currentSelectedYear) return;
    try {
      await createTermMutation.mutateAsync(data);
      toast.success("Term added successfully!");
      setIsCreateTermOpen(false);
      resetTermForm();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create term");
    }
  };

  return (
    <PageShell
      title="Academic Structure"
      description="Manage academic calendar years, school terms, and operational milestones."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Academics" },
      ]}
      actions={
        isAdmin ? (
          <Button onClick={() => setIsCreateYearOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Academic Year
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Academic Years List */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Academic Years</CardTitle>
                  <CardDescription className="text-xs">
                    List of all configured school years and their status
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner className="h-6 w-6 text-primary" />
                </div>
              ) : isError ? (
                <EmptyState
                  title="Failed to load academic years"
                  description="An error occurred while connecting to the academic service."
                  action={
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Try Again
                    </Button>
                  }
                />
              ) : !academicYears || academicYears.length === 0 ? (
                <EmptyState
                  title="No academic years yet"
                  description="Start by adding the current or upcoming academic year."
                  action={
                    isAdmin ? (
                      <Button size="sm" onClick={() => setIsCreateYearOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Academic Year
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicYears.map((year) => {
                        const isSelected = currentSelectedYear?.id === year.id;
                        return (
                          <TableRow
                            key={year.id}
                            className={isSelected ? "bg-muted/40 font-medium" : undefined}
                          >
                            <TableCell className="font-semibold text-foreground">
                              {year.name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {year.startDate} to {year.endDate}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={year.status === "ACTIVE" ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {year.status || "CONFIGURED"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={isSelected ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedYear(year)}
                                className="h-8 gap-1 text-xs"
                              >
                                <span>Terms</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Year Terms */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {currentSelectedYear ? `Terms: ${currentSelectedYear.name}` : "Terms"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Academic terms and session blocks for this year
                  </CardDescription>
                </div>
                {isAdmin && currentSelectedYear && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreateTermOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Term
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!currentSelectedYear ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Select an academic year to inspect its terms.
                </p>
              ) : isTermsLoading ? (
                <div className="flex justify-center p-6">
                  <LoadingSpinner className="h-5 w-5 text-primary" />
                </div>
              ) : !terms || terms.length === 0 ? (
                <EmptyState
                  title="No terms added"
                  description={`No terms have been scheduled for ${currentSelectedYear.name} yet.`}
                  action={
                    isAdmin ? (
                      <Button size="sm" onClick={() => setIsCreateTermOpen(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add First Term
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-2">
                  {terms.map((term) => (
                    <div
                      key={term.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm bg-card hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{term.name}</span>
                          {term.isMandatory && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 text-muted-foreground">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{term.startDate} – {term.endDate}</span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Year Dialog */}
      <Dialog open={isCreateYearOpen} onOpenChange={setIsCreateYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Academic Year</DialogTitle>
            <DialogDescription>
              Define a new academic year. Start and end dates must be valid dates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitYear(onSubmitYear)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year-name">Name</Label>
              <Input
                id="year-name"
                placeholder="e.g. 2026/2027"
                {...registerYear("name")}
              />
              {yearErrors.name && (
                <p className="text-xs text-destructive">{yearErrors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year-start">Start Date</Label>
                <Input
                  id="year-start"
                  type="date"
                  {...registerYear("startDate")}
                />
                {yearErrors.startDate && (
                  <p className="text-xs text-destructive">{yearErrors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-end">End Date</Label>
                <Input
                  id="year-end"
                  type="date"
                  {...registerYear("endDate")}
                />
                {yearErrors.endDate && (
                  <p className="text-xs text-destructive">{yearErrors.endDate.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateYearOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createYearMutation.isPending}>
                {createYearMutation.isPending ? "Creating..." : "Save Academic Year"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Term Dialog */}
      <Dialog open={isCreateTermOpen} onOpenChange={setIsCreateTermOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Term to {currentSelectedYear?.name}</DialogTitle>
            <DialogDescription>
              Schedule a term within this academic year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTerm(onSubmitTerm)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="term-name">Term Name</Label>
              <Input
                id="term-name"
                placeholder="e.g. Term 1 or First Semester"
                {...registerTerm("name")}
              />
              {termErrors.name && (
                <p className="text-xs text-destructive">{termErrors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term-start">Start Date</Label>
                <Input
                  id="term-start"
                  type="date"
                  {...registerTerm("startDate")}
                />
                {termErrors.startDate && (
                  <p className="text-xs text-destructive">{termErrors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="term-end">End Date</Label>
                <Input
                  id="term-end"
                  type="date"
                  {...registerTerm("endDate")}
                />
                {termErrors.endDate && (
                  <p className="text-xs text-destructive">{termErrors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isMandatory"
                checked={watchTerm("isMandatory")}
                onCheckedChange={(checked) => setTermValue("isMandatory", !!checked)}
              />
              <Label htmlFor="isMandatory" className="text-sm font-normal cursor-pointer">
                Mandatory term for all students
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTermOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTermMutation.isPending}>
                {createTermMutation.isPending ? "Adding..." : "Add Term"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
