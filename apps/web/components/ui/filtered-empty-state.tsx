import * as React from "react"
import { SearchX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FilteredEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onClearFilters?: () => void
}

export function FilteredEmptyState({
  className,
  title = "No results found",
  description = "We couldn't find anything matching your current filters. Try adjusting them.",
  onClearFilters,
  ...props
}: FilteredEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline">
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  )
}
