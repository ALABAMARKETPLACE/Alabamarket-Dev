"use client";
import React, { useState, useEffect, useRef } from "react";
import { Layout, notification } from "antd";
import { useSession, signOut } from "next-auth/react";

import Header from "../_components/header";
import SideBar from "../_components/sideBar";

function ScreenLayout(props: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();
  const previousStatusRef = useRef<string | null>(null);
  const [notificationApi, contextHolder] = notification.useNotification();

  useEffect(() => {
    // If we were authenticated and are now unauthenticated, the session expired
    if (
      previousStatusRef.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      notificationApi.warning({
        message: "Session Expired",
        description: "Your session has expired. Please log in again.",
        duration: 2,
        onClose: async () => {
          await signOut({ callbackUrl: "/login" });
        },
      });
    }
    previousStatusRef.current = status;
  }, [status, notificationApi]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout>
      {contextHolder}
      <Header
        data={{
          ...props?.data,
          type: props?.data?.type || props?.data?.user?.type,
          role: props?.data?.role || props?.data?.user?.role,
        }} 
        onMenuClick={toggleSidebar} 
        sidebarOpen={sidebarOpen} 
      />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-SideBarOverlay"
          onClick={closeSidebar}
        />
      )}
      <Layout.Sider
        width={260}
        className={`dashboard-SideBarContainer ${sidebarOpen ? "open" : ""}`}
        style={{
          backgroundColor: "#fff",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 999,
        }}
      >
        <SideBar 
          data={{
            ...props?.data,
            type: props?.data?.type || props?.data?.user?.type,
            role: props?.data?.role || props?.data?.user?.role,
          }} 
          onRouteClick={closeSidebar} 
        />
      </Layout.Sider>
      <Layout className="dashboard-ContentLayout">
        <Layout.Content>
          <div className="dashboard-Layout">{props?.children}</div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default ScreenLayout;
