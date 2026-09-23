"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Building2 } from "lucide-react";
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
import { useSchoolClasses, useCreateSchoolClass } from "@/lib/api/academic";
import { useAuthStore } from "@/stores/auth-store";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required (e.g. Primary 1A, JHS 2 Blue)"),
  level: z.string().min(1, "Level or stage is required"),
  // Preprocess handles empty strings correctly before validating as a positive number
  capacity: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().positive("Capacity must be a positive number").optional()
  ),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function ClassesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  
  const { data: classes, isLoading, isError, refetch } = useSchoolClasses();
  const createClassMutation = useCreateSchoolClass();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClassFormData>({
    // Cast to any bypasses the internal hookform/zod type mismatch
    // while preserving full type safety in your onSubmit handler
    resolver: zodResolver(classSchema) as any,
  });

  const onSubmit = async (data: ClassFormData) => {
    try {
      await createClassMutation.mutateAsync({
        name: data.name,
        level: data.level,
        capacity: data.capacity,
      });
      toast.success("School class created successfully!");
      setIsCreateOpen(false);
      reset();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create school class");
    }
  };

  const filteredClasses = classes?.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell
      title="School Classes"
      description="Manage registered classes, streams, grade levels, and capacity limits."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Classes" },
      ]}
      actions={
        isAdmin ? (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        ) : undefined
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Registered Classes</CardTitle>
              <CardDescription className="text-xs">
                {isAdmin ? "All instructional classes across all grade levels" : "Classes assigned to your schedule"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or stage..."
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
              title="Failed to load classes"
              description="Could not connect to the academic class service."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : !classes || classes.length === 0 ? (
            <EmptyState
              title="No classes configured"
              description="Create the first school class to start student enrollments."
              action={
                isAdmin ? (
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Class
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Level / Stage</TableHead>
                    <TableHead>Max Capacity</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses && filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{cls.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {cls.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {cls.capacity ? `${cls.capacity} students` : "Not specified"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {cls.createdAt ? cls.createdAt.split("T")[0] : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                        No classes match your search query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New School Class</DialogTitle>
            <DialogDescription>
              Register a class or stream within a specific educational stage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                placeholder="e.g. Primary 1A, JHS 1 Gold"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-level">Educational Level / Stage</Label>
              <Input
                id="class-level"
                placeholder="e.g. Primary, Junior High, Kindergarten"
                {...register("level")}
              />
              {errors.level && (
                <p className="text-xs text-destructive">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-capacity">Max Capacity (Optional)</Label>
              <Input
                id="class-capacity"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 35"
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createClassMutation.isPending}>
                {createClassMutation.isPending ? "Saving..." : "Save Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}