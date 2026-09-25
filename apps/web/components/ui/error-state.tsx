import * as React from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onRetry?: () => void
  error?: Error | null
}

export function ErrorState({
  className,
  title = "Something went wrong",
  description = "There was a problem loading this data. Please try again.",
  onRetry,
  error,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-destructive/80">
          {description}
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <pre className="mb-4 max-w-full overflow-auto rounded bg-destructive/10 p-2 text-left text-[10px] text-destructive">
            {error.message}
          </pre>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
