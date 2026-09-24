"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const { data: terms, isLoading } = useQuery({
    queryKey: ["terms"],
    queryFn: async () => apiClient<any[]>("/terms"),
  });

  if (isLoading) return <LoadingSpinner />;

  if (!terms || terms.length === 0) {
    return (
      <EmptyState
        title="No Terms"
        description="No terms have been configured."
        icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
        action={<Button>Add Term</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Terms</h2>
      <div className="grid gap-4">
        {terms.map(t => (
          <div key={t.id} className="p-4 border rounded shadow-sm">{t.name}</div>
        ))}
      </div>
    </div>
  );
}