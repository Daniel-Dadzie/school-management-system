"use client";
import { useSchoolClasses } from "@/lib/api/academic";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Users } from "lucide-react";
import { CreateClassDialog } from "./create-class-dialog";

export default function Classes() {
  const { data: classes, isLoading } = useSchoolClasses();

  if (isLoading) return <LoadingSpinner />;

  if (!classes || classes.length === 0) {
    return (
      <EmptyState
        title="No Classes"
        description="No classes have been configured."
        icon={<Users className="w-10 h-10 text-muted-foreground" />}
        action={<CreateClassDialog />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Classes</h2>
        <CreateClassDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <div key={c.id} className="p-5 border rounded-lg shadow-sm bg-card transition-shadow hover:shadow-md">
            <h3 className="text-xl font-semibold mb-1">{c.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{c.level}</p>
            <div className="flex items-center text-sm">
              <span className="font-medium mr-2">Capacity:</span>
              <span>{c.capacity ?? 'Not set'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
