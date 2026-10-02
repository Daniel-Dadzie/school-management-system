import { RoleGuard } from "@/components/auth/role-guard";
import { permissions } from "@/lib/authorization/permissions";

export default function AcademicSetupLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard permission={permissions.academicsManage}>{children}</RoleGuard>;
}
