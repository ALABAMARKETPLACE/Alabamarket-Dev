"use client";
import { Button, Checkbox, Form, Input, Modal, notification } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import ImagePicker from "@/app/(dashboard)/_components/ImagePicker/imagePicker";
import API from "@/config/API_ADMIN";
import { COMPRESS_IMAGE, POST, PUT } from "@/util/apicall";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import "../styles.scss";

const DESKTOP_BANNER = {
  width: 1920,
  height: 230,
  cropperHeight: 280,
};

const MOBILE_BANNER = {
  width: 768,
  height: 210,
  cropperHeight: 220,
};

const formatDimensions = (width: number, height: number) =>
  `${width}px × ${height}px`;
type Props = {
  visible: boolean;
  data: any;
  onClose: () => void;
  onChange: () => void;
};
function FormModal(props: Props) {
  const [form] = Form.useForm();
  const [desktopImage, setDesktopImage] = useState<any>();
  const [mobileImage, setMobileImage] = useState<any>();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();

  const desktopAspectRatio = useMemo(
    () => DESKTOP_BANNER.width / DESKTOP_BANNER.height,
    []
  );
  const mobileAspectRatio = useMemo(
    () => MOBILE_BANNER.width / MOBILE_BANNER.height,
    []
  );

  //functions

  useEffect(() => {
    if (props?.data?.id) {
      form.setFieldsValue({
        description: props?.data?.description,
        title: props?.data?.title,
        status: props?.data?.status,
      });
      setDesktopImage(
        props?.data?.img_desk ? { url: props?.data?.img_desk } : undefined
      );
      setMobileImage(
        props?.data?.img_mob ? { url: props?.data?.img_mob } : undefined
      );
    } else {
      form.resetFields();
      setDesktopImage(undefined);
      setMobileImage(undefined);
    }
  }, [form, props?.data, props?.visible]);

  const resolveImageUpload = async (
    source: any,
    fallback?: string
  ): Promise<{ url: string } | undefined> => {
    if (source?.file) {
      return await COMPRESS_IMAGE(source.file);
    }
    if (source?.url) {
      return { url: source.url };
    }
    if (fallback) {
      return { url: fallback };
    }
    return undefined;
  };
  const mutationCreate = useMutation({
    mutationFn: async (body: any) => {
      const desktopUpload = await resolveImageUpload(
        desktopImage,
        props?.data?.img_desk
      );
      if (!desktopUpload?.url) {
        throw new Error("Desktop banner image is required");
      }
      const mobileUpload =
        (await resolveImageUpload(mobileImage, props?.data?.img_mob)) ??
        desktopUpload;
      const obj = {
        description: body?.description,
        img_desk: desktopUpload.url,
        img_mob: mobileUpload.url,
        status:
          session?.role === "admin" && props?.data?.id ? body?.status : true,
        title: body?.title,
      };
      if (props?.data?.id) {
        return PUT(API.BANNER_EDIT + props?.data?.id, obj);
      }
      return POST(API.BANNER_ADD, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      onClose();
      Notifications["success"]({
        message: `Successfully ${props?.data?.id ? "updated" : "Added"} Banner`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_banners"] });
    },
  });
  const onClose = () => {
    props?.onClose();
    form.resetFields();
    setDesktopImage(undefined);
    setMobileImage(undefined);
  };

  const onFinish = async (val: any) => {
    if (!desktopImage) {
      Notifications["error"]({
        message: `Please add the desktop banner image (${formatDimensions(
          DESKTOP_BANNER.width,
          DESKTOP_BANNER.height
        )})`,
      });
      return;
    }
    if (!desktopImage?.file && !desktopImage?.url) {
      Notifications["error"]({
        message: `Your desktop banner is missing. Please upload it again.`,
      });
      return;
    }
    if (!mobileImage?.file && !mobileImage?.url) {
      Notifications["info"]({
        message:
          "Mobile banner image not provided. The desktop banner will be reused on mobile.",
      });
    }
    mutationCreate.mutate({ ...val });
  };

  return (
    <Modal
      open={props?.visible}
      title={`${props?.data?._id ? "Edit" : "New"} Banner`}
      onCancel={onClose}
      footer={false}
      centered
      width={900}
    >
      {contextHolder}
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Row>
          <Col sm={6}>
            <div className="pb-2 d-flex flex-column gap-1">
              <span>Desktop Banner</span>
              <small className="text-muted">
                Recommended size: {formatDimensions(
                  DESKTOP_BANNER.width,
                  DESKTOP_BANNER.height
                )}
              </small>
            </div>
            <ImagePicker
              fileURL={desktopImage?.url ?? props?.data?.img_desk}
              onChange={(val) => setDesktopImage(val)}
              aspectRatio={desktopAspectRatio}
              width={"100%"}
              height={DESKTOP_BANNER.cropperHeight}
              outputWidth={DESKTOP_BANNER.width}
              outputHeight={DESKTOP_BANNER.height}
            />
            <div className="pb-2 mt-4 d-flex flex-column gap-1">
              <span>Mobile Banner</span>
              <small className="text-muted">
                Recommended size: {formatDimensions(
                  MOBILE_BANNER.width,
                  MOBILE_BANNER.height
                )}
              </small>
            </div>
            <ImagePicker
              fileURL={mobileImage?.url ?? props?.data?.img_mob}
              onChange={(val) => setMobileImage(val)}
              aspectRatio={mobileAspectRatio}
              width={"100%"}
              height={MOBILE_BANNER.cropperHeight}
              outputWidth={MOBILE_BANNER.width}
              outputHeight={MOBILE_BANNER.height}
            />
          </Col>
          <Col sm={6}>
            <Form.Item label="Title" name="title">
              <Input placeholder="Title" size="large" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Description" rows={3} size="large" />
            </Form.Item>
            {session?.role === "admin" && props?.data?.id ? (
              <Form.Item name="status" label="Status" valuePropName="checked">
                <Checkbox defaultChecked>Show in HomePage</Checkbox>
              </Form.Item>
            ) : null}
          </Col>
        </Row>
        <Row>
          <Col sm={6}></Col>
          <Col sm={6}>
            <Row>
              <Col sm={6}>
                <Button block size="large" onClick={onClose}>
                  Close
                </Button>
              </Col>
              <Col sm={6}>
                <Button
                  htmlType="submit"
                  block
                  size="large"
                  type="primary"
                  loading={mutationCreate.isPending}
                >
                  Done
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default FormModal;
