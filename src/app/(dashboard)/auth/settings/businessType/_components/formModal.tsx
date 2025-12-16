"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect } from "react";
import { POST, PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";

interface props {
  type: string;
  visible: boolean;
  onClose: () => void;
  data: any;
}
function BusinessTypeFormModal({ onClose, type, visible, data }: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const mutationCreate = useMutation({
    mutationFn: (body: object) => {
      if (type == "edit") {
        return PUT(API.BUSINESS_TYPE + data?.id, body);
      }
      return POST(API.BUSINESS_TYPE, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      handleClose();
      Notifications["success"]({
        message: `Business Type ${
          type == "add" ? "Added" : "Updated"
        } Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [API.BUSINESS_TYPE] });
    },
  });

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  useEffect(() => {
    if (type == "edit") {
      form.setFieldsValue({
        name: data?.name,
        description: data?.description,
      });
    } else {
      form.resetFields();
    }
  }, [visible]);
  return (
    <Modal
      title={`${type == "edit" ? "Update" : "Add New"} Business Type`}
      open={visible}
      centered
      footer={false}
      onCancel={onClose}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={mutationCreate.mutate}
        initialValues={{ featured: false }}
      >
        <Form.Item
          label="Title"
          name={"name"}
          rules={[
            {
              required: true,
              message: "Please Enter the Title",
            },
          ]}
        >
          <Input placeholder="Title" size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Please Enter the Description",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Description" size="large" />
        </Form.Item>

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

export default BusinessTypeFormModal;
