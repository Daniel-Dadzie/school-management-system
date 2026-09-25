"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ForbiddenState } from "@/components/ui/forbidden-state";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return <ForbiddenState />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <ForbiddenState />;
  }

  return <>{children}</>;
}
