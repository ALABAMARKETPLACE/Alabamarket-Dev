"use client";
import { Button, Form, Input, Modal, notification, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { COMPRESS_IMAGE, POST, PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import ImagePicker from "../../../_components/ImagePicker/imagePicker";

interface props {
  type: string;
  open: boolean;
  close: Function;
  data: any;
}
function AddSubcategoryModal({ close, type, open, data }: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const { Option } = Select;
  const [image, setImage] = useState<any>(null);
  const [bannerImg, setBannerImg] = useState<any>(null);
  const categories = useAppSelector(reduxCategoryItems)?.map((item) => ({
    value: item?.id,
    label: item?.name,
  }));

  const mutationCreate = useMutation({
    mutationFn: async (body: object) => {
      let imageUrl = data?.image ?? null;
      let bannerUlr = data?.bannerImg ?? null;
      if (image?.file) {
        const response = await COMPRESS_IMAGE(image.file);
        imageUrl = response?.url;
      }
      if (bannerImg?.file) {
        const response = await COMPRESS_IMAGE(bannerImg.file);
        bannerUlr = response?.url;
      }
      const obj = {
        ...body,
        image: imageUrl,
        bannerImg: bannerUlr,
      };
      if (type == "edit") return PUT(API.SUBCATEGORY + data?._id, obj);
      if (!imageUrl) return Promise.reject(new Error("No Image is Selected"));
      return POST(API.SUBCATEGORY, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      onClose();
      Notifications["success"]({
        message: `Subcategory ${
          type == "add" ? "Added" : "Updated"
        } Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_subcategory"] });
    },
  });

  const onClose = () => {
    close();
    form.resetFields();
    setImage(null);
    setBannerImg(null);
  };

  useEffect(() => {
    if (type == "edit") {
      form.setFieldsValue({
        name: data?.name,
        image: data?.image,
        category_id: data?.category_id,
        description: data?.description,
      });
    } else {
      form.resetFields();
    }
  }, [open]);
  return (
    <Modal
      title={`${type == "edit" ? "Update" : "Add New"} Subcategory`}
      open={open}
      okText={type == "edit" ? "Update" : "Add"}
      centered
      cancelButtonProps={{ style: { display: "none" } }}
      okButtonProps={{ style: { display: "none" } }}
      width={900}
      onCancel={onClose}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => mutationCreate.mutate(values)}
        initialValues={{ featured: false }}
      >
        <div className="row">
          <div className="col-md-6">
            <Form.Item label={"Cover Image"}>
              <ImagePicker
                fileURL={image?.url ?? (data?.image || "")}
                onChange={(val) => setImage(val)}
                aspectRatio={1 / 1}
                width={"100%"}
                height={"40vh"}
              />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item label="Banner Image">
              <ImagePicker
                fileURL={bannerImg?.url ?? (data?.bannerImg || "")}
                onChange={(val) => setBannerImg(val)}
                aspectRatio={1 / 1}
                width={"100%"}
                height={"40vh"}
              />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Name"
              name={"name"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Name",
                },
              ]}
            >
              <Input placeholder="input Name" size="large" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Category"
              name="category_id"
              rules={[
                {
                  required: true,
                  message: "Please Enter Category ID",
                },
              ]}
            >
              <Select
                bordered={false}
                style={{ width: "100%" }}
                className="border rounded"
                size="large"
                allowClear
                defaultValue={"Select Category"}
              >
                {categories?.map((item: any, index: number) => (
                  <Option key={index} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Description"
              name={"description"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Description",
                },
              ]}
            >
              <TextArea rows={3} placeholder="Description" size="large" />
            </Form.Item>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={form.submit}
            loading={mutationCreate.isPending}
          >
            {type == "add" ? "Add" : "Update"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddSubcategoryModal;
