import {
    Button,
    Form,
    Modal,
    Select,
    UploadProps,
    message,
    notification,
  } from "antd";
  import Dragger from "antd/es/upload/Dragger";
  import { InboxOutlined } from "@ant-design/icons";
  import React, { useEffect, useState } from "react";
//   import API from "../../../config/API";
//   import { EXCEL_UPLOAD, GET, POST } from "../../../utils/apiCalls";
  import { FaFileDownload } from "react-icons/fa";
  import { MdDownload } from "react-icons/md";
//   import { Link } from "react-router-dom";
  import Link from "next/link";
import API from "@/config/API";
import { EXCEL_UPLOAD, GET } from "@/util/apicall";
  
  function FilePickerModal({ open, close, getProducts }: any) {
    const [file, setFile] = useState<any>(null);
    const [Notifications, contextHolder] = notification.useNotification();
    const [subCategories, setSubCategories] = useState<any>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
  
    const LoadCategory = async () => {
      try {
        const response: any = await GET(API.CATEGORY);
        if (response?.status) {
          setCategories(response?.data);
        }
      } catch (err) {
        console.log("err", err);
      }
    };
    useEffect(() => {
      LoadCategory();
    }, [open]);
    const props: UploadProps = {
      accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      name: "file",
      maxCount: 1,
      beforeUpload: (file) => {
        return false;
      },
      onChange(info) {
        setFileList(info.fileList.slice(-1));
        setFile(info?.file?.originFileObj);
      },
      onDrop(e) {
        console.log(e);
      },
      fileList,
    };
    const handleRemove = () => {
      setFileList([]);
    };
    console.log(fileList?.[0]?.originFileObj);
    const categoryChangeHandler = (value: any) => {
      const index: any = categories?.findIndex((item: any) => item.id == value);
      if (index != -1) {
        let item = categories[index]?.sub_categories;
        setSubCategories(item);
        form.setFieldsValue({ subCategory: "" });
      }
    };
    const submit = async (values: any) => {
      const formDataFiles = new FormData();
      formDataFiles.append("file", fileList?.[0]?.originFileObj);
      setLoading(true);
      try {
        if (fileList?.[0]?.originFileObj) {
          const respnse: any = await EXCEL_UPLOAD(
            fileList?.[0]?.originFileObj,
            values?.category,
            values?.subCategory
          );
          if (respnse?.status) {
            Notifications["success"]({
              message: "File Uploaded Successfully",
              description: "",
            });
            getProducts();
            closeModal();
          } else {
            Notifications["error"]({
              message: respnse?.message,
              description: "",
            });
          }
        } else {
          Notifications["error"]({
            message: "No Excel file has been Selected.",
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
      form.resetFields();
      handleRemove();
    };
    return (
      <Modal
        title="Upload Excel File"
        open={open}
        onOk={() => form.submit()}
        onCancel={closeModal}
        centered
        confirmLoading={loading}
        okText="Upload"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <div className="d-flex me-auto">
              <Link href="/samplefile.xlsx" target="_blank" download>
                Get Sample <MdDownload size={23} color={API.COLOR} />
              </Link>
            </div>
            <Button
              onClick={() => {
                // modalClose();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" loading={loading} onClick={form.submit}>
              Upload
            </Button>
          </div>
        }
      >
        {contextHolder}
        <Form.Item
          name={"excel"}
          rules={[
            { required: true, message: "Please choose File" },
            () => ({
              validator(_, value) {
                if (!file) {
                  return Promise.reject(new Error("Please choose a file"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Upload only Excel Files with xlsx extension. the Table format is:{" "}
              <br />
              <span className="fw-bold">
                No, Barcode, Name, Price, Quantity, Image
              </span>
            </p>
          </Dragger>
        </Form.Item>
  
        <Form onFinish={submit} form={form} className="mt-2" layout="vertical">
          <Form.Item
            name={"category"}
            label="Category"
            rules={[{ required: true, message: "Please choose Category" }]}
          >
            <Select
              style={{ width: "100%" }}
              className="border rounded"
              allowClear
              onChange={categoryChangeHandler}
              placeholder="Select category"
              size="large"
            >
              {categories?.map((item: any, index: number) => (
                <Select.Option key={index} value={Number(item.id)}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={"subCategory"}
            label="SubCategory"
            rules={[{ required: true, message: "Please choose Subcategory" }]}
          >
            <Select
              style={{ width: "100%" }}
              className="border rounded"
              allowClear
              placeholder="Select Subcategory"
              size="large"
            >
              {subCategories?.map((item: any, index: number) => (
                <Select.Option key={index} value={Number(item._id)}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
  
  export default FilePickerModal;
  