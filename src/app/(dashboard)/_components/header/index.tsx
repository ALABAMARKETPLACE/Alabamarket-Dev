"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Tag, Popover, Badge } from "antd";

import { HiOutlineUserCircle } from "react-icons/hi2";
import { IoNotifications, IoSettingsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineErrorOutline } from "react-icons/md";
import { LuShieldCheck } from "react-icons/lu";
import { HiMenu, HiX } from "react-icons/hi";

import LogoBox from "@/config/logoBox.png";
import ProfilePopover from "./profilePopover";
import NotificationPopover from "./notificationPopover";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API";
import { GET } from "@/util/apicall";

const Clock = dynamic(() => import("react-live-clock"), {
  ssr: false,
});
function Header(props: any) {
  const router = useRouter();
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompactScreen(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const notificationOverlayStyle = {
    width: isCompactScreen ? "calc(100vw - 24px)" : 400,
    maxWidth: "calc(100vw - 24px)",
    right: isCompactScreen ? undefined : 0,
  };
  const notificationPopoverPlacement = isCompactScreen
    ? "bottom"
    : "bottomRight";

  // Fetch notifications (seller only)
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    enabled: props?.data?.role !== "admin",
    queryKey: [API.USER_NOTIFICATIONS],
    queryFn: ({ signal }) => GET(API.USER_NOTIFICATIONS, {}, signal),
    select: (res: any) => (res?.status ? res?.data : []),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n?.is_read).length
    : 0;

  const handleMenuClick = () => {
    if (props?.onMenuClick) {
      props.onMenuClick();
    }
  };

  return (
    <header className="dashboard-Header">
      {/* Mobile Menu Toggle Button */}
      <div className="dashboard-MobileMenuToggle" onClick={handleMenuClick}>
        {props?.sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </div>
      <div className="dashboard-HeaderBox5">
        <div>
          <Image src={LogoBox} alt="logo" />
        </div>
        <div className="dashboard-HeaderPanelText">
          {props?.data?.role === "admin"
            ? "Admin"
            : props?.data?.role === "delivery_company" || props?.data?.type === "delivery_company"
            ? "Delivery Company"
            : props?.data?.role === "driver" || props?.data?.type === "driver"
            ? "Driver"
            : "Seller"} Panel
          <br />
          <div className="dashboard-Headertext3">V 1.0.0</div>
        </div>
      </div>
      <div className="dashboard-HeaderBox3 dashboard-HeaderWebsite">
        <a href="/">Website</a>
      </div>
      <div className="dashboard-HeaderBox3 dashboard-HeaderClock">
        <Clock format={"h:mm:ss A"} ticking={true} />
      </div>
      <div style={{ flex: 1 }} />
      <div className="dashboard-HeaderBox1">
        {props?.data?.user?.mail_verify ? null : (
          <Tag
            color="red"
            icon={<MdOutlineErrorOutline />}
            className="dashboard-HeaderTag dashboard-HeaderVerifyTag"
          >
            Verify Mail
          </Tag>
        )}
        <div>
          <Tag
            color="green"
            icon={<LuShieldCheck />}
            className="dashboard-HeaderTag dashboard-HeaderRoleTag"
          >
            {props?.data?.role}
          </Tag>
        </div>

        {/* Notification icon with unread count (Seller only) */}
        {props?.data?.role !== "admin" ? (
          <Popover
            content={
              <NotificationPopover
                notifications={notifications || []}
                isLoading={isLoadingNotifications}
                onClose={() => setNotificationPopoverOpen(false)}
              />
            }
            placement={notificationPopoverPlacement}
            arrow={false}
            trigger="click"
            open={notificationPopoverOpen}
            onOpenChange={setNotificationPopoverOpen}
            overlayStyle={notificationOverlayStyle}
            overlayClassName="dashboard-NotificationPopoverOverlay"
          >
            <div className="dashboard-HeaderBox3" style={{ cursor: "pointer" }}>
              <Badge count={unreadCount} color="#ff4d4f">
                <IoNotifications size={23} />
              </Badge>
            </div>
          </Popover>
        ) : null}
        {props?.data?.role === "admin" ? (
          <div
            className="dashboard-HeaderBox3"
            onClick={() => router.push("/auth/settings")}
          >
            <IoSettingsOutline size={23} />
          </div>
        ) : null}
        <Popover
          content={<ProfilePopover data={props?.data} />}
          placement="bottomLeft"
          arrow={false}
        >
          <div className="dashboard-HeaderBox2">
            {props?.data?.user?.image ? (
              <img src={props?.data?.user?.image} />
            ) : (
              <HiOutlineUserCircle size={40} />
            )}
            <div className="dashboard-HeaderBox4">
              <div className="dashboard-Headertext1">
                {props?.data?.user?.first_name}
              </div>
              <div className="dashboard-Headertext2">
                {props?.data?.user?.email}
              </div>
            </div>
            <div>
              <IoIosArrowDown size={20} />
            </div>
          </div>
        </Popover>
      </div>
    </header>
  );
}

export default Header;
