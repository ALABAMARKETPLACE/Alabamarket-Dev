"use client";
import { List, notification, Pagination } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineNotification } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { MdError } from "react-icons/md";
import { navigateNotification } from "@/util/notifications.util";

function UserNotifications() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const { data: notifications, isLoading, isError } = useQuery({
    queryFn: async () =>
      await GET(API.USER_NOTIFICATIONS, {
        order: "DESC",
        page,
        take: pageSize,
      }),
    queryKey: ["notifications", page, pageSize],
    retry: 1,
  });

  const onClick = (item: any) => {
    router.push(navigateNotification(item?.typeId, item?.type));
  };

  return (
    <>
      {contextHolder}
      <div className="fs-5 fw-medium">
        {`My Notifications (${notifications?.meta?.itemCount ?? 0})`}
      </div>
      <hr />
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading notifications</div>
      ) : Array.isArray(notifications?.data) ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={notifications?.data}
            locale={{
              emptyText: "You have No Notifications at the moment.",
            }}
            renderItem={(item: any) => (
              <List.Item
                className="order-list-item"
                onClick={() => onClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div className="h-100">
                      <img
                        src={item?.image}
                        style={{
                          width: "50px",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        alt="Image"
                      />
                    </div>
                  }
                  title={<h6>{item?.title}</h6>}
                  description={item?.message}
                />
              </List.Item>
            )}
          />
          <div className="d-flex justify-content-center mt-3">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={notifications?.meta?.itemCount || 0}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setPage(1); // Reset to the first page on page size change
              }}
              onChange={(current) => setPage(current)}
            />
          </div>
        </>
      ) : (
        <div>No notifications available.</div>
      )}
    </>
  );
}

export default UserNotifications;
