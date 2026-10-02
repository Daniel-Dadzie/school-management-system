"use client";

import { useQuery } from '@tanstack/react-query';
import { AuditAdapter } from '@/lib/functional/adapters/audit-adapter';
import type { AuditFilters } from '@/lib/functional/services/audit-service';

export function useAuditEvents(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ['audit-events', filters],
    queryFn: () => AuditAdapter.getEvents(filters),
  });
}
