"use client";
import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import Header from "../_components/header";
import SideBar from "../_components/sideBar";

function ScreenLayout(props: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Header data={props?.data} onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-SideBarOverlay"
          onClick={closeSidebar}
        />
      )}
      <Layout.Sider
        width={230}
        className={`dashboard-SideBarContainer ${sidebarOpen ? "open" : ""}`}
        style={{
          backgroundColor: "#fff",
          height: "100vh",
        }}
      >
        <SideBar data={props?.data} onRouteClick={closeSidebar} />
      </Layout.Sider>
      <Layout>
        <Layout.Content>
          <div className="dashboard-Layout">{props?.children}</div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default ScreenLayout;
