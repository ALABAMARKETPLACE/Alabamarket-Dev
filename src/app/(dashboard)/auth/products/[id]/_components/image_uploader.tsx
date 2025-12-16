import { List, Modal, UploadProps, message, notification } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Image } from "antd";
import { FaCopy } from "react-icons/fa6";
import API from "@/config/API";
import { UPLOAD_IMAGES } from "@/util/apicall";
// import API from "../../../config/API";

function ImageUploadModal({ open, close, getProducts }: any) {
  const [Notifications, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const props: UploadProps = {
    accept: "image/jpeg, image/png, image/webp",
    name: "file",
    maxCount: 5,
    multiple: true,
    beforeUpload: (file) => {
      return false;
    },
    onChange(info) {
      setFileList(info.fileList);
    },
    onDrop(e) {
      console.log(e);
    },
    fileList,
  };
  const handleRemove = () => {
    setFileList([]);
  };

  const submit = async () => {
    const images = [];
    for (const item of fileList) {
      images.push(item?.originFileObj);
    }
    setLoading(true);
    try {
      if (!images?.length) {
        Notifications["warning"]({
          message: "Please Select Atleast One Image",
          description: "",
        });
        return;
      }
      const response: any = await UPLOAD_IMAGES(images);
      if (response?.status) {
        setImages(response?.data);
        handleRemove();
        Notifications["success"]({
          message: "Images Uploaded Successfully",
          description: "",
        });
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "Something went wrong..",
        description: "",
      });
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => {
    close();
    handleRemove();
  };
  return (
    <Modal
      title="Upload Images"
      open={open}
      onOk={submit}
      onCancel={closeModal}
      centered
      confirmLoading={loading}
      okText="Upload"
    >
      {contextHolder}

      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag Images to this area to upload
        </p>
        <p className="ant-upload-hint">
          Upload only PNG, JPEG/JPG, WEBP images. Upload only quality images.
          image size should be less than 2MB
        </p>
      </Dragger>
      {images?.length ? (
        <List
          className="mt-3"
          size="small"
          header={<div className="fw-bold">Uploaded Image Urls:</div>}
          bordered
          dataSource={images}
          renderItem={(item: any) => (
            <List.Item>
              <div className="d-flex gap-2">
                <Image width={100} src={item?.url} />
                <p style={{ wordBreak: "break-all" }}>{item?.url}</p>
              </div>
              <FaCopy className="align-self-center" size={23} color={API.COLOR}
                onClick={() => {
                  navigator.clipboard
                    .writeText(item?.url)
                    .then(() => {
                      message.success("Text copied to clipboard!");
                    })
                    .catch((err) => {
                      message.error("Failed to copy text.");
                      console.error("Failed to copy text: ", err);
                    });
                }}
              />
            </List.Item>
          )}
        />
      ) : null}
    </Modal>
  );
}

export default ImageUploadModal;
