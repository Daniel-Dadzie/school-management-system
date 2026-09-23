"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, BookOpen } from "lucide-react";
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
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useSubjects, useCreateSubject } from "@/lib/api/academic";
import { useAuthStore } from "@/stores/auth-store";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required (e.g. Mathematics, Integrated Science)"),
  code: z.string().min(1, "Subject code is required (e.g. MATH, ENG, SCI)"),
  department: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: subjects, isLoading, isError, refetch } = useSubjects();
  const createSubjectMutation = useCreateSubject();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      await createSubjectMutation.mutateAsync(data);
      toast.success("Subject registered successfully!");
      setIsCreateOpen(false);
      reset();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to register subject");
    }
  };

  const filteredSubjects = subjects?.filter((subj) =>
    subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subj.department && subj.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageShell
      title="Subjects & Courses"
      description="Manage the academic curriculum, subjects, codes, and subject departments."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Subjects" },
      ]}
      actions={
        isAdmin ? (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        ) : undefined
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Curriculum Subjects</CardTitle>
              <CardDescription className="text-xs">
                {isAdmin ? "Standard subjects offered across all grades" : "Subjects you are assigned to teach"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects or codes..."
                  className="pl-8 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingSpinner className="h-6 w-6 text-primary" />
            </div>
          ) : isError ? (
            <EmptyState
              title="Failed to load subjects"
              description="Could not connect to the academic subject service."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : !subjects || subjects.length === 0 ? (
            <EmptyState
              title="No subjects registered"
              description="Add the core subjects taught at CarePoint Community School."
              action={
                isAdmin ? (
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Subject
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects && filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subj) => (
                      <TableRow key={subj.id}>
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span>{subj.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {subj.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {subj.department || "General Studies"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {subj.createdAt ? subj.createdAt.split("T")[0] : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                        No subjects match your search query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Register a curriculum subject and assign its subject code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="e.g. Mathematics, Integrated Science"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                placeholder="e.g. MATH, SCI, ENG"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-dept">Department (Optional)</Label>
              <Input
                id="subject-dept"
                placeholder="e.g. Sciences, Languages, Humanities"
                {...register("department")}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSubjectMutation.isPending}>
                {createSubjectMutation.isPending ? "Saving..." : "Save Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
