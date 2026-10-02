"use client";

import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, MailOpen, Mail, CheckCircle2 } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationAdapter } from "@/lib/functional/adapters/notification-adapter";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { NotificationRecord } from "@/lib/functional/types";

export default function ParentNotificationsPage() {
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationAdapter.getMyNotifications()
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => NotificationAdapter.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-parent-metrics"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationAdapter.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-parent-metrics"] });
    }
  });

  const handleNotificationClick = (notification: NotificationRecord) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    if (notification.status === 'UNREAD') {
      markAsReadMutation.mutate(notification.id);
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Notifications" breadcrumbs={[{label: "Notifications"}]} permission={permissions.notificationsView}>
        <div className="flex h-[200px] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  let unreadCount = 0;
  if (notifications) {
    unreadCount = notifications.filter(n => n.status === 'UNREAD').length;
  }

  return (
    <PageShell
      title="Notifications"
      breadcrumbs={[{label: "Notifications"}]}
      permission={permissions.notificationsView}
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={() => markAllAsReadMutation.mutate()}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        {!notifications || notifications.length === 0 ? (
          <EmptyState
            title="You're all caught up"
            description="There are no new notifications."
            icon={Bell}
          />
        ) : (
          <div className="grid gap-3">
            {notifications.map(notification => (
              <Card 
                key={notification.id}
                className={`transition-colors cursor-pointer hover:border-primary ${notification.status === 'UNREAD' ? 'bg-muted/50 border-muted' : 'border-transparent'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                    {notification.status === 'UNREAD' ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium leading-none">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotification ? new Date(selectedNotification.createdAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {selectedNotification?.message}
            </p>
            {!!selectedNotification?.link && (
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href={selectedNotification.link}>View Details</a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
