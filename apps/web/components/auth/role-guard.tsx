"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { hasPermission, type Permission } from "@/lib/authorization/permissions";

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
}

export function RoleGuard({ permission, children }: PermissionGuardProps) {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return <ForbiddenState />;
  }

  if (!hasPermission(user.role, permission)) {
    return <ForbiddenState />;
  }

  return <>{children}</>;
}
