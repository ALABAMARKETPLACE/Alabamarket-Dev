"use client";
import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import Header from "../_components/header";
import SideBar from "../_components/sideBar";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { storeToken, reduxAccessToken } from "@/redux/slice/authSlice";

function ScreenLayout(props: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: sessionData } = useSession();
  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector(reduxAccessToken);

  // Sync NextAuth session token into Redux when Redux token is missing or stale
  useEffect(() => {
    const sessionToken = (sessionData as any)?.token;
    if (sessionToken && sessionToken !== reduxToken) {
      const refreshToken = (sessionData as any)?.refreshToken ?? null;
      dispatch(storeToken({ token: sessionToken, refreshToken }));
    }
  }, [sessionData, reduxToken, dispatch]);

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
