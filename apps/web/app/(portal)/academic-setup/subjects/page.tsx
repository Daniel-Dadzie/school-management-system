"use client";
import { useSubjects } from "@/lib/api/academic";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { BookOpen } from "lucide-react";
import { CreateSubjectDialog } from "../create-dialogs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export default function Subjects() {
  const { data: subjects, isLoading } = useSubjects();

  if (isLoading) return <LoadingSpinner />;

  if (!subjects || subjects.length === 0) {
    return (
      <EmptyState
        title="No Subjects"
        description="No subjects have been configured."
        icon={<BookOpen className="w-10 h-10 text-muted-foreground" />}
        action={<CreateSubjectDialog />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Subjects</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/academic-setup/subjects/bulk">
              <LayoutGrid className="mr-2 h-4 w-4" /> Bulk Create
            </Link>
          </Button>
          <CreateSubjectDialog />
        </div>
      </div>
      <div className="grid gap-4">
        {subjects.map((s) => (
          <div key={s.id} className="p-4 border rounded shadow-sm">{s.name} ({s.code})</div>
        ))}
      </div>
    </div>
  );
}
