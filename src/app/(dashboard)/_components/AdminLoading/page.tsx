'use client'
import { Space, Spin } from "antd";
import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";

const AdminLoading = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

  return (
    <div className="Loading-box">
      <Space className="loading-spaceStyle" direction="vertical">
        <Spin indicator={antIcon} />
        <div className="loading-loadingText">Loading...</div>
      </Space>
    </div>
  );
};

export default AdminLoading;
