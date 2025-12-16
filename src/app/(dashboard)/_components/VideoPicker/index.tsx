"use client";
import React, { useRef, useState } from "react";
import { Button, Progress, Upload } from "antd";
import { UploadOutlined, VideoCameraOutlined, DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

interface VideoPickerProps {
  onChange: (file: File | null) => void;
  videoURL?: string;
  maxSize?: number; // in MB
}

const VideoPicker: React.FC<VideoPickerProps> = ({ 
  onChange, 
  videoURL,
  maxSize = 50 
}) => {
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(videoURL || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoChange = (file: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, MOV, AVI, WEBM)');
      return false;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      alert(`Video file size must be less than ${maxSize}MB`);
      return false;
    }

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setVideoPreview(previewURL);
    setVideo(file);
    onChange(file);

    return false; // Prevent default upload behavior
  };

  const handleRemove = () => {
    if (videoPreview && !videoURL) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setVideo(null);
    onChange(null);
  };

  return (
    <div style={{ width: "100%" }}>
      {videoPreview ? (
        <div style={{ 
          border: "1px solid #d9d9d9", 
          borderRadius: "8px", 
          padding: "16px",
          background: "#fafafa"
        }}>
          <video
            ref={videoRef}
            src={videoPreview}
            controls
            style={{
              width: "100%",
              maxHeight: "300px",
              borderRadius: "4px",
              marginBottom: "12px"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {video ? `${(video.size / (1024 * 1024)).toFixed(2)} MB` : "Video loaded"}
            </span>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
            >
              Remove Video
            </Button>
          </div>
        </div>
      ) : (
        <Upload.Dragger
          name="video"
          accept="video/*"
          beforeUpload={handleVideoChange}
          showUploadList={false}
          style={{ background: "#fafafa" }}
        >
          <p className="ant-upload-drag-icon">
            <VideoCameraOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          </p>
          <p className="ant-upload-text">Click or drag video file to upload</p>
          <p className="ant-upload-hint">
            Supported formats: MP4, MOV, AVI, WEBM<br />
            Maximum file size: {maxSize}MB
          </p>
        </Upload.Dragger>
      )}
    </div>
  );
};

export default VideoPicker;


