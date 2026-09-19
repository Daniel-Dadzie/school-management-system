import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={`h-8 w-8 animate-spin text-primary ${className || ""}`} />;
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
