"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationAdapter } from "@/lib/functional/adapters/notification-adapter";

const NOTIFICATIONS_KEY = ["notifications", "mine"] as const;
const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

export function useMyNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => NotificationAdapter.getMyNotifications(),
    refetchInterval: 30_000, // poll every 30 s to pick up new notifications
    staleTime: 10_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () => NotificationAdapter.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationAdapter.markAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationAdapter.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

