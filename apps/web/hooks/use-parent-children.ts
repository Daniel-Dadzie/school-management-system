import { useQuery } from '@tanstack/react-query';
import { AuthorizationError } from '@/lib/authorization/permissions';
import { ParentAdapter } from '@/lib/functional/adapters/parent-adapter';
import { isMockMode } from '@/lib/functional/config';
import { useAuthStore } from '@/stores/auth-store';

export const parentChildrenQueryKey = (parentUserId?: string) =>
  ['parent-children', parentUserId] as const;

export function useParentChildren() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: parentChildrenQueryKey(user?.id),
    enabled: user?.role === 'PARENT' && Boolean(user.id),
    queryFn: async () => {
      if (user?.role !== 'PARENT' || !user.id) {
        throw new AuthorizationError();
      }
      if (!isMockMode) {
        throw new Error('Parent portal data is not available in API mode.');
      }

      return ParentAdapter.getChildrenForParent(user.id);
    },
  });
}
