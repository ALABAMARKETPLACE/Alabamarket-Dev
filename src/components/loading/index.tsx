import { Space, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.scss";
import React from "react";

const Loading = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

  return (
    <div className="Loading-box">
      <Space className="loading-spaceStyle" direction="vertical">
        <Spin indicator={antIcon} />
        <br />
        <div className="loading-loadingText">Loading...</div>
      </Space>
    </div>
  );
};

export default Loading;
