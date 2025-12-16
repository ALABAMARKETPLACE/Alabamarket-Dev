import { Button, Form, Input } from "antd";
import { Col, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";
// import ImagePicker from "../components/ImagePicker";
import ImagePicker from "../../../../../_components/picker2";
import React from "react";
const VariantFromTable = (props: any) => {
  const [form] = Form.useForm();
  const finish = (value: any) => {
    props.onChange(value);
  };

  const updateImage = (value: any, index: number) => {
    try {
      const values = form.getFieldValue(["variants"]);
      values[index].image = value;
      form.setFieldsValue({ [`variants`]: values });
    } catch (err) {
      console.log("err", err);
    }
  };

  const removeImage = (index: number) => {
    try {
      console.log("index", index);
    } catch (err) {}
  };
  const array = Array.isArray(props?.data?.variants)
    ? props?.data?.variants
    : props?.data;
  return (
    <Form
      form={form}
      onFinish={finish}
      initialValues={{ variants: props?.data?.variants ?? props?.data }}
    >
      <div style={{ minHeight: "64vh" }}>
        <Table responsive bordered size="sm">
          <thead>
            <tr>
              <td>Image</td>
              <td>Variant</td>
              <td>Price</td>
              <td>Units</td>
              <td>SKU</td>
              <td>Barcode</td>
              <td></td>
            </tr>
          </thead>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <tbody>
                {fields.map(({ key, name, ...restField }, index) => (
                  <tr key={index}>
                    <td style={{ width: 50 }}>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "image"]}
                        rules={[{ required: true, message: "" }]}
                      >
                        <ImagePicker
                          fileURL={
                            form.getFieldValue(["variants", name]).image?.url
                              ?.Location ??
                            form.getFieldValue(["variants", name]).image?.url
                          }
                          height={"40px"}
                          aspectRatio={1 / 1}
                          onChange={(file) => {
                            updateImage(file, name);
                          }}
                          size="small"
                          crop
                        />
                      </Form.Item>
                    </td>
                    <td style={{ width: 300 }}>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "combination"]}
                        rules={[{ required: true, message: "" }]}
                      >
                        <div className="VariantFromTable-txt1">
                          {array?.[key]?.combination?.map(
                            (fla: any, indexo: number) => {
                              let valo = "";
                              valo =
                                valo +
                                (indexo === 0
                                  ? `${fla?.variant}:${fla?.value}`
                                  : " / " + `${fla?.variant}:${fla?.value}`);
                              return valo;
                            }
                          )}
                        </div>
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "" }]}
                      >
                        <Input type="number" />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "units"]}
                        rules={[{ required: true, message: "" }]}
                      >
                        <Input type="number" max={100000} min={0} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "sku"]}
                        rules={[
                          { required: true, message: "Please Enter SKU" },
                          {
                            min: 10,
                            message: "Atleast 10 characters required",
                          },
                          {
                            max: 16,
                            message: "Maximum 16 characters required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "barcode"]}
                        rules={[
                          { required: true, message: "Please Enter Barcode" },
                          {
                            min: 10,
                            message: "Atleast 10 characters required",
                          },
                          {
                            max: 16,
                            message: "Maximum 16 characters required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </td>
                    <td style={{ width: 10 }}>
                      {/* <Button
                        type="link"
                        onClick={() => {
                          console.log(props?.data[key]);
                        }}
                      >
                        <MdEditSquare />
                      </Button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </Form.List>
        </Table>
      </div>
      <Row>
        <Col sm={2}>
          <Button onClick={() => props.edit()} type="link">
            Edit Variants
          </Button>
        </Col>
        <Col sm={4}></Col>

        <Col sm={2}>
          <Button size="large" block onClick={() => props?.onBack()}>
            Back
          </Button>
        </Col>
        <Col sm={4}>
          <Form.Item>
            <Button size="large" block type="primary" htmlType="submit">
              Continue
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default VariantFromTable;
