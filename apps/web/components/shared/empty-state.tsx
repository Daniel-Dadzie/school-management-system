import * as React from "react"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  const isLucide = typeof Icon === "function" || typeof Icon === "object" && '$$typeof' in (Icon as any);
  
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {Icon && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {typeof Icon === 'function' || (typeof Icon === 'object' && !React.isValidElement(Icon as any)) ? (
              // @ts-ignore
              <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            ) : (
              Icon
            )}
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action}
      </div>
    </div>
  )
}
