"use client";
import React from "react";
import { List, Empty, Spin, Badge, Typography, Button } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import API from "@/config/API";
import { PATCH } from "@/util/apicall";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  image?: string;
  is_read: boolean;
  createdAt: string;
}

interface NotificationPopoverProps {
  notifications: Notification[];
  isLoading?: boolean;
  onClose?: () => void;
}

function NotificationPopover({
  notifications,
  isLoading,
  onClose,
}: NotificationPopoverProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => PATCH(API.USER_NOTIFICATION_MARK_READ + id, {}),
    onMutate: async (id: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [API.USER_NOTIFICATIONS] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData([
        API.USER_NOTIFICATIONS,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData([API.USER_NOTIFICATIONS], (old: any) => {
        // Check if data is an array or nested in response
        if (Array.isArray(old)) {
          return old.map((notif: Notification) =>
            notif.id === id ? { ...notif, is_read: true } : notif
          );
        } else if (old?.data) {
          return {
            ...old,
            data: old.data.map((notif: Notification) =>
              notif.id === id ? { ...notif, is_read: true } : notif
            ),
          };
        }
        return old;
      });

      console.log("[NotificationPopover] Optimistically marked as read:", id);

      // Return a context object with the snapshotted value
      return { previousNotifications };
    },
    onError: (err, id, context: any) => {
      // Rollback on error
      queryClient.setQueryData(
        [API.USER_NOTIFICATIONS],
        context.previousNotifications
      );
      console.error("[NotificationPopover] Error marking as read:", err);
    },
    onSuccess: (data, id) => {
      console.log(
        "[NotificationPopover] Successfully marked as read:",
        id,
        data
      );
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: [API.USER_NOTIFICATIONS] });
    },
  });

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[NotificationPopover] Marking notification as read:", id);
    markAsReadMutation.mutate(id);
  };

  const getNavigationPath = (notification: Notification): string => {
    switch (notification.type) {
      case "seller_approval":
      case "subscription_plan":
        return "/auth/dashboard";
      case "order":
        return "/auth/orders";
      case "product":
        return "/auth/products";
      case "settlement":
        return "/auth/settlements";
      default:
        return "/auth/dashboard";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("[NotificationPopover] Notification clicked:", notification);

    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    const path = getNavigationPath(notification);
    console.log("[NotificationPopover] Navigating to:", path);

    router.push(path);

    if (onClose) {
      onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "seller_approval":
        return "✅";
      case "subscription_plan":
        return "📦";
      case "order":
        return "🛒";
      default:
        return "🔔";
    }
  };

  if (isLoading) {
    return (
      <div
        className="dashboard-NotificationPopover"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div className="dashboard-NotificationPopover">
      <div className="dashboard-NotificationPopoverHeader">
        <Title level={5} style={{ margin: 0 }}>
          <BellOutlined /> Notifications
        </Title>
        {notifications?.length > 0 && (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {notifications.filter((n) => !n.is_read).length} unread
          </Text>
        )}
      </div>

      <div className="dashboard-NotificationPopoverBody">
        {!notifications || notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: "20px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`dashboard-NotificationPopoverItem ${
                  !item.is_read ? "unread" : ""
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <List.Item.Meta
                  className="dashboard-NotificationPopoverItemMeta"
                  avatar={
                    <div
                      className={`dashboard-NotificationPopoverAvatar ${
                        !item.is_read ? "unread" : ""
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt="notification"
                          className="dashboard-NotificationPopoverAvatarImage"
                        />
                      ) : (
                        getNotificationIcon(item.type)
                      )}
                    </div>
                  }
                  title={
                    <div className="dashboard-NotificationPopoverTitle">
                      <Text
                        strong={!item.is_read}
                        className="dashboard-NotificationPopoverTitleText"
                      >
                        {item.title}
                      </Text>
                      {!item.is_read && (
                        <Badge
                          status="processing"
                          className="dashboard-NotificationPopoverTitleBadge"
                        />
                      )}
                    </div>
                  }
                  description={
                    <div className="dashboard-NotificationPopoverDescription">
                      <Text className="dashboard-NotificationPopoverMessage">
                        {item.message}
                      </Text>
                      <div className="dashboard-NotificationPopoverMetaRow">
                        <Text
                          type="secondary"
                          className="dashboard-NotificationPopoverTimestamp"
                        >
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                        {!item.is_read && (
                          <Button
                            type="link"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="dashboard-NotificationPopoverMarkRead"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default NotificationPopover;
