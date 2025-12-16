"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Form, Input, Modal, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { COMPRESS_IMAGE, POST, PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import ImagePicker from "@/app/(dashboard)/_components/ImagePicker/imagePicker";

interface props {
  type: string;
  open: boolean;
  close: Function;
  data: any;
}
function AddCategoryModal({ close, type, open, data }: props) {
  const [form] = Form.useForm();
  const [featured, setFeatured] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<any>(null);

  const mutationCreate = useMutation({
    mutationFn: async (body: object) => {
      let imageUrl = data?.image ?? null;
      if (image?.file) {
        const response = await COMPRESS_IMAGE(image.file);
        imageUrl = response?.url;
      }
      const obj = { ...body, image: imageUrl };
      if (type == "edit") return PUT(API.CATEGORY + data?.id, obj);
      if (!imageUrl) return Promise.reject(new Error("Please Select an image"));
      return POST(API.CATEGORY, obj);
    },
    retry: 2,
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      onClose();
      Notifications["success"]({
        message: `Category ${type == "add" ? "Added" : "Updated"} Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_category"] });
    },
  });

  const onClose = () => {
    close();
    form.resetFields();
    setImage(null);
    mutationCreate.reset();
  };

  useEffect(() => {
    if (type == "edit") {
      form.setFieldsValue({
        name: data?.name,
        image: data?.image,
        description: data?.description,
        featured: data?.featured,
        featuredTitle: data?.featureTitle,
      });
    } else {
      form.resetFields();
    }
  }, [open]);
  return (
    <Modal
      title={`${type == "edit" ? "Update" : "Add New"} Category`}
      open={open}
      okText={type == "add" ? "Add" : "Update"}
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
            <ImagePicker
              fileURL={image?.url ?? (data?.image || "")}
              onChange={(val) => setImage(val)}
              aspectRatio={1 / 1}
              width={"100%"}
              height={"40vh"}
            />
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
              <Input placeholder="Category Name" size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Please Enter Description",
                },
              ]}
            >
              <TextArea rows={4} placeholder="Description" size="large" />
            </Form.Item>
            <Form.Item
              name="featured"
              label="Feature Category"
              valuePropName="checked"
            >
              <Checkbox
                onChange={(e) => setFeatured(() => e?.target?.checked)}
                defaultChecked={featured}
              >
                Featured
              </Checkbox>
            </Form.Item>
            {featured || data?.featured ? (
              <Form.Item
                label="featured Title"
                name={"featuredTitle"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Feature Title",
                  },
                ]}
              >
                <Input placeholder="Featured Title" size="large" />
              </Form.Item>
            ) : null}
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={form.submit}
            loading={mutationCreate.isPending}
          >
            {type == "edit" ? "Update" : "Add"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddCategoryModal;
