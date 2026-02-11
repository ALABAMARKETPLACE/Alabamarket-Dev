"use client";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";

interface LoadingProps {
  size?: "small" | "default" | "large";
  text?: string;
  fullHeight?: boolean;
}

function Loading({ size = "large", text, fullHeight = true }: LoadingProps) {
  return (
    <div className={`dashboard-loading ${fullHeight ? 'dashboard-loading--full' : ''}`}>
      <div className="dashboard-loading__content">
        <div className="dashboard-loading__spinner">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: size === "large" ? 40 : size === "small" ? 20 : 32 }} spin />}
            size={size}
          />
        </div>
        {text && <p className="dashboard-loading__text">{text}</p>}
      </div>
    </div>
  );
}

export default Loading;
