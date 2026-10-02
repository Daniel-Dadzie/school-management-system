import * as React from "react"
import { ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ForbiddenStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  backLink?: string
}

export function ForbiddenState({
  className,
  title = "Access Denied",
  description = "You don't have permission to view this resource. If you believe this is a mistake, please contact your administrator.",
  backLink = "/dashboard",
  ...props
}: ForbiddenStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        <Button asChild>
          <Link href={backLink}>Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
