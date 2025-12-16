import { useQuery } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useMemo, useState } from "react";

import "react-quill/dist/quill.snow.css";
import API from "@/config/API_ADMIN";
import dynamic from "next/dynamic";
interface props {
  onFinish: Function;
  formData: Record<string, string | number>;
}
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});
function ProductDetails({ onFinish, formData }: props) {
  const [selectedC, setCategory] = useState<null | string | number>(
    formData?.category || null
  );
  const [form] = Form.useForm();
  const { data: category, isLoading } = useQuery<any>({
    queryKey: [API.CATEGORY],
    select: (res) => {
      if (res?.status) return res?.data;
      return [];
    },
  });
  const subcategory = useMemo(() => {
    if (Array.isArray(category)) {
      const selected = category?.find((item: any) => item?.id == selectedC);
      if (selected) return selected?.sub_categories;
    }
    return [];
  }, [selectedC]);

  // Generate SKU/Barcode if not provided
  const generateSKU = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKU${timestamp.substring(timestamp.length - 6)}${random}`;
  };

  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `${timestamp.substring(timestamp.length - 10)}${random}`;
  };

  const handleFormFinish = (values: any) => {
    // Auto-generate SKU if not provided or too short
    if (!values.sku || values.sku.trim().length < 10) {
      values.sku = generateSKU();
    }

    // Auto-generate barcode if not provided or too short
    if (!values.bar_code || values.bar_code.trim().length < 10) {
      values.bar_code = generateBarcode();
    }

    // Check if product weight is greater than 100
    if (values.product_weight && values.product_weight > 100) {
      Modal.confirm({
        title: "High Product Weight",
        content: `The product weight you entered is ${values.product_weight}. This is quite heavy. Are you sure you want to continue?`,
        onOk: () => {
          onFinish(values);
        },
        okText: "Yes, Continue",
        cancelText: "No, Edit",
      });
    } else {
      onFinish(values);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        status: "available",
        bulk_order: "notaccept",
        ...formData,
      }}
      onFinish={handleFormFinish}
    >
      <div className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-12">
              <Form.Item
                label="Product Name"
                name={"name"}
                rules={[
                  { required: true, message: "Please Enter Product Name" },
                  { max: 200, message: "Product name length is too much" },
                ]}
              >
                <Input placeholder="Title" size="large" />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                name={"description"}
                label="Product Description"
                rules={[
                  {
                    required: true,
                    message: "Please Enter product Description",
                  },
                  {
                    max: 250,
                    message: "Product Description length is too much",
                  },
                ]}
              >
                <TextArea rows={4} placeholder="Description" maxLength={250} />
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                name={"category"}
                label={"Product Category"}
                rules={[{ required: true, message: "Please chose Category" }]}
              >
                <Select
                  style={{ width: "100%" }}
                  size="large"
                  allowClear
                  onSelect={(v) => {
                    setCategory(v);
                    form.setFieldsValue({ subCategory: undefined });
                  }}
                  placeholder="Select category"
                  loading={isLoading}
                  options={
                    Array.isArray(category)
                      ? category?.map((it: any) => ({
                          value: it?.id,
                          label: it?.name,
                        }))
                      : []
                  }
                ></Select>
              </Form.Item>
            </div>
            <div className="col-12">
              <Form.Item
                label={"Product Subcategory"}
                name={"subCategory"}
                rules={[
                  { required: true, message: "Please chose Subcategory" },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  size="large"
                  allowClear
                  placeholder="Select Subcategory"
                  options={
                    Array.isArray(subcategory)
                      ? subcategory?.map((it: any) => ({
                          value: it?._id,
                          label: it?.name,
                        }))
                      : []
                  }
                ></Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name={"brand"}
                label="Brand"
                rules={[
                  { required: true, message: "Please Enter Brand Name" },
                  { max: 200, message: "Length is too much" },
                ]}
              >
                <Input placeholder="Brand Name" size="large" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                label="Manufacture"
                name={"manufacture"}
                rules={[
                  { required: true, message: "Please Enter Manufacturer" },
                  { max: 200, message: "Length is too much" },
                ]}
              >
                <Input placeholder="Manufacture" size="large" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="Barcode (Optional)"
                name={"bar_code"}
                rules={[
                  {
                    max: 16,
                    message: "Product Barcode length must be below 16 chars",
                  },
                  {
                    min: 10,
                    message:
                      "Product Barcode length must be atleast 10 characters",
                  },
                ]}
              >
                <Input placeholder="Barcode" size="large" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name={"sku"}
                label="SKU (Optional)"
                rules={[
                  {
                    max: 16,
                    message: "Product SKU length must be below 16 chars",
                  },
                  {
                    min: 10,
                    message: "Product SKU length must be atleast 10 characters",
                  },
                ]}
              >
                <Input placeholder="sku" size="large" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="Purchase Price"
                name={"purchase_rate"}
                rules={[
                  {
                    required: true,
                    message: "Enter Purchase rate of the Product",
                  },
                ]}
              >
                <Input placeholder="0.00" type="number" size="large" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                label="Retail Price"
                name={"retail_rate"}
                rules={[
                  {
                    required: true,
                    message: "Enter Reail Rate of the product",
                  },
                ]}
              >
                <Input placeholder="0.00" type="number" size="large" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="Available Unit"
                name={"unit"}
                rules={[
                  {
                    required: true,
                    message: "Enter Available Units.",
                  },
                ]}
              >
                <Input
                  placeholder="Unit"
                  type="number"
                  max={10000}
                  size="large"
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name={"units"}
                label="Available Unit for Bulk order"
                rules={[
                  {
                    required: true,
                    message: "Enter Available units for Bulk Order",
                  },
                ]}
              >
                <Input
                  placeholder="Available Units"
                  max={10000}
                  size="large"
                  type="number"
                  prefix={0}
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name={"product_weight"}
                label="Product Weight"
                rules={[
                  {
                    required: true,
                    message: "Please enter product weight",
                  },
                ]}
              >
                <Input
                  placeholder="Enter weight"
                  size="large"
                  type="number"
                  step="0.01"
                  min={0}
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name={"bulk_order"}
                label="Bulk Order Status"
                rules={[
                  {
                    required: true,
                    message:
                      "Please Select if you suppor Bulk order for this Product",
                  },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  allowClear
                  onChange={() => {}}
                  placeholder="Select Bulk Order"
                  size="large"
                >
                  <Select.Option value={"accept"}>Accept</Select.Option>
                  <Select.Option value={"notaccept"}>Not Accept</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                label="Product Status"
                name={"status"}
                rules={[
                  {
                    required: true,
                    message: "Please Choose the Status of The product",
                  },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  size="large"
                  allowClear
                  onChange={() => {}}
                  placeholder="Select Status"
                >
                  <Select.Option value={"available"}>Available</Select.Option>
                  <Select.Option value={"notavailable"}>
                    Not Available
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className="col-12" style={{ height: "270px" }}>
          <p className="mb-2">Product Speicifications</p>
          <div style={{ backgroundColor: "white" }} className="h-100">
            <Form.Item name={"specifications"}>
              <ReactQuill
                theme="snow"
                value={String(formData?.specifications || "")}
                onChange={(v) => form.setFieldValue("specifications", v)}
                style={{ backgroundColor: "white", height: "230px" }}
              />{" "}
            </Form.Item>
          </div>
        </div>
        <div className="col-8"></div>
        <div className="col-4 mt-5">
          <Button type="primary" size="large" block htmlType="submit">
            Continue{" "}
          </Button>
        </div>
      </div>
    </Form>
  );
}

export default ProductDetails;
