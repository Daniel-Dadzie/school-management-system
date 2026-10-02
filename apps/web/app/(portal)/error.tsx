"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Portal page unavailable"
      description="This portal page could not be displayed. Try again or return to the dashboard."
      onRetry={reset}
    />
  );
}
