"use client";

import React, { useState } from "react";
import { Input } from "antd";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  style,
}) => {
  return (
    <Input.TextArea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      placeholder="Enter product specifications..."
      style={{
        backgroundColor: "white",
        ...style,
      }}
    />
  );
};

export default QuillEditor;
