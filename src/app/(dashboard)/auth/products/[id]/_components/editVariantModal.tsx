import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, notification, Form, Input, Tag } from "antd";
import API from "@/config/API_ADMIN";
import { GET, COMPRESS_IMAGE, PUT } from "@/util/apicall";
import { Col, Row } from "react-bootstrap";
import ImagePicker from "../../../../_components/picker2";
import { ReactCropperElement } from "react-cropper";
import moment from "moment";

const EditProductVariantModal = (props: any) => {
  const [Notifications, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const variant = props?.selectedVariant;
  const cropperRef = useRef<ReactCropperElement>(null);
  const [form] = Form.useForm();
  const [image, setImage] = useState<any>(null);
  const closeModal = () => {
    setImage(null);
    props?.closeModal();
    form.resetFields();
  };
  const onFinish = async (values: any) => {
    const url = API.PRODUCT_UPDATE_VARIANTS + variant?.id;
    let imgUrl = "";
    try {
      setLoading(true);
      if (image?.file) {
        const imageUrl: any = await COMPRESS_IMAGE(image?.file);
        imgUrl = imageUrl?.Location;
      }
      const obj = { ...values, image: imgUrl };
      const response: any = await PUT(url, obj);
      if (response?.status) {
        closeModal();
        if (typeof props?.getProductDetails == "function") {
          props?.getProductDetails();
        }
      } else {
        Notifications["error"]({
          message: response?.message ?? "",
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

  useEffect(() => {
    form.setFieldsValue({
      sku: variant?.sku,
      barcode: variant?.barcode,
      units: Number(variant?.units),
      price: variant?.price,
    });
  }, [props?.openModal]);
  return (
    <>
      {contextHolder}
      <Modal
        open={props?.openModal ?? false}
        onCancel={closeModal}
        centered
        title={`Edit Variant (${props?.product?.name ?? ""})`}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button
            key="activate"
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
          >
            Update Product
          </Button>,
        ]}
      >
        <ImagePicker
          aspectRatio={1 / 1}
          fileURL={image?.url || props?.selectedVariant?.image}
          onChange={(file: any) => setImage(file)}
          crop
        />
        {Array.isArray(variant?.combination) == true ? (
          <div>
            {variant?.combination?.map((item: any) => {
              return (
                <Tag bordered={false}>
                  <span>{`${item.variant}: ${item?.value} `}</span>
                </Tag>
              );
            })}
          </div>
        ) : null}
        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row>
            <Col md="6">
              <Form.Item label="Barcode" name="barcode">
                <Input style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item label="SKU" name="sku">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item
                label="Units"
                name="units"
                rules={[{ required: true, message: "Please Input Units" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col md="6">
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: "Please input Price" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditProductVariantModal;
