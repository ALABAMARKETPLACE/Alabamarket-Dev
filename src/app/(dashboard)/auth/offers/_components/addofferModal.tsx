"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { COMPRESS_IMAGE, POST, PUT } from "@/util/apicall";
import dayjs from "dayjs";
import ImagePicker from "../../../_components/ImagePicker/imagePicker";

interface props {
  type: string;
  open: boolean;
  close: Function;
  data: any;
}
function AddOfferModal({ close, type, open, data }: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    if (type == "edit") {
      form.setFieldsValue({
        title: data?.title,
        tag: data?.tag,
        image: data?.image,
        start_date: dayjs(data?.start_date, "YYYY-MM-DD"),
        end_date: dayjs(data?.end_date, "YYYY-MM-DD"),
        status: data?.status ?? false,
      });
    } else {
      form.resetFields();
    }
  }, [open]);

  const mutationCreate = useMutation({
    mutationFn: async (body: object) => {
      let imageUrl = data?.image ?? null;
      if (image?.file) {
        const response = await COMPRESS_IMAGE(image.file);
        imageUrl = response?.url;
      }
      if (type == "edit")
        return PUT(API.OFFERS + data?.id, { ...body, image: imageUrl });
      if (!imageUrl) return Promise.reject(new Error("Please Select an image"));
      return POST(API.OFFERS, { ...body, image: imageUrl });
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      onClose();
      Notifications["success"]({
        message: `Offer ${type == "add" ? "Added" : "Updated"} Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
    },
  });

  const onClose = () => {
    setImage({});
    close();
    form.resetFields();
  };
  return (
    <Modal
      title={`${type == "edit" ? "Update" : "Add New"} Offer`}
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
        initialValues={{ status: true }}
      >
        <div className="row">
          <div className="col-md-6">
            <ImagePicker
              fileURL={image?.url ?? (data?.image || "")}
              onChange={(val) => setImage(val)}
              aspectRatio={4 / 3}
              width={"100%"}
              height={"40vh"}
            />
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Title"
              name={"title"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Title",
                },
              ]}
            >
              <Input placeholder="Offer Title" size="large" />
            </Form.Item>

            <Form.Item
              label="Tag"
              name="tag"
              rules={[
                {
                  required: true,
                  message: "Please Enter Tag",
                },
              ]}
            >
              <TextArea rows={4} placeholder="Offer Tag" size="large" />
            </Form.Item>
            <Form.Item name="status" valuePropName="checked">
              <Checkbox>Offer Status</Checkbox>
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="Start Date"
              name="start_date"
              rules={[
                {
                  required: true,
                  message: "Please Select Offer Start date",
                },
              ]}
            >
              <DatePicker
                size="large"
                className="w-100"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              label="End Date"
              name="end_date"
              rules={[
                {
                  required: true,
                  message: "Please Select Offer End date",
                },
              ]}
            >
              <DatePicker
                size="large"
                className="w-100"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={form.submit}
            loading={mutationCreate.isPending}
            disabled={mutationCreate.isPending}
          >
            {type == "edit" ? "Update" : "Add"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddOfferModal;
