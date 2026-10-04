import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "@/lib/functional/services/notification-service";
import { useAuthStore } from "@/stores/auth-store";

export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => NotificationService.getMyNotifications(),
    enabled: !!user?.id,
  });
  
  const unreadCount = query.data?.filter(n => n.status === 'UNREAD').length || 0;
  
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      NotificationService.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      // If we mark as read, parent metrics might have changed unread count
      queryClient.invalidateQueries({ queryKey: ["dashboard-parent-metrics"] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      NotificationService.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-parent-metrics"] });
    }
  });

  return {
    ...query,
    unreadCount,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingRead: markAsRead.isPending || markAllAsRead.isPending,
  };
}
