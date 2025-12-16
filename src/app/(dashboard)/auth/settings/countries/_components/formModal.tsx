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
function CountryFormModal({ onClose, type, visible, data }: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const mutationCreate = useMutation({
    mutationFn: (body: object) => {
      if (type == "edit") {
        return PUT(API.COUNTRIES + data?.id, body);
      }
      return POST(API.COUNTRIES, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      handleClose();
      Notifications["success"]({
        message: `Country ${type == "add" ? "Added" : "Updated"} Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [API.COUNTRIES] });
    },
  });

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  useEffect(() => {
    if (type == "edit") {
      form.setFieldsValue({
        country_name: data?.country_name,
        description: data?.description,
      });
    } else {
      form.resetFields();
    }
  }, [visible]);
  return (
    <Modal
      title={`${type == "edit" ? "Update" : "Add New"} Country`}
      open={visible}
      centered
      footer={false}
      onCancel={onClose}
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={mutationCreate.mutate}>
        <Form.Item
          label="Country Name"
          name={"country_name"}
          rules={[
            {
              required: true,
              message: "Please Enter the Country Name",
            },
            {
              max: 200,
              message: "Country name must be less than 200 characters",
            },
          ]}
        >
          <Input placeholder="Country Name" size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              max: 300,
              message: "Description must be less than 300 characters",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Description (Optional)"
            size="large"
          />
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

export default CountryFormModal;
