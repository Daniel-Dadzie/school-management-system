import { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem as UIItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { RoleGuard } from "@/components/auth/role-guard";
import type { Permission } from "@/lib/authorization/permissions";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  actions?: ReactNode;
  permission?: Permission;
  children: ReactNode;
}

export default function PageShell({ title, description, breadcrumbs, actions, permission, children }: PageShellProps) {
  const lastBreadcrumbIndex = (breadcrumbs?.length ?? 0) - 1;
  const visibleBreadcrumbs = breadcrumbs?.filter((item, index) =>
    index < lastBreadcrumbIndex || item.label.trim().toLowerCase() !== title.trim().toLowerCase()
  );

  const content = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {visibleBreadcrumbs && visibleBreadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {visibleBreadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2.5">
                  <UIItem>
                    {item.href ? (
                      <BreadcrumbLink asChild><Link href={item.href}>{item.label}</Link></BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </UIItem>
                  {index < visibleBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full">
        {children}
      </div>
    </div>
  );

  if (permission) {
    return <RoleGuard permission={permission}>{content}</RoleGuard>;
  }

  return content;
}

