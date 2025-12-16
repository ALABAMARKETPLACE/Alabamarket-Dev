"use client";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";
function Loading(props: any) {
  return (
    <div className="dashboard-Loading">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        size="large"
      />
    </div>
  );
}

export default Loading;
