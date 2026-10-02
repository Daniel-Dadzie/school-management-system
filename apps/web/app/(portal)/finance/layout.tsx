import { RoleGuard } from '@/components/auth/role-guard';
import { permissions } from '@/lib/authorization/permissions';

export default function FinanceLayout({ children }: { children: React.ReactNode }) { return <RoleGuard permission={permissions.financeView}>{children}</RoleGuard>; }
