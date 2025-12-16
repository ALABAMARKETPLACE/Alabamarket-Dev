import { Button, Form, Input } from "antd";
import { Col, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import ImagePicker2 from "../../../../_components/picker2";
import { MdEditSquare } from "react-icons/md";
import React, { useEffect } from "react";
const VariantFormUpdate = (props: any) => {
  const [form] = Form.useForm();
  const finish = async (value: any) => {
    await props.onChange(value);
    form.resetFields();
    form.setFieldsValue({ variants: [] });
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
  return (
    <Form
      form={form}
      onFinish={finish}
      initialValues={{ variants: props?.data }}
    >
      <div>
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
                        <ImagePicker2
                          fileURL={
                            form.getFieldValue(["variants", name]).image?.url
                          }
                          onChange={(value: any) => updateImage(value, name)}
                          height={"auto"}
                          crop
                          size="small"
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
                          {props?.data?.[key]?.combination.map(
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
                        <Input type="number" max={100000} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        noStyle
                        {...restField}
                        name={[name, "sku"]}
                        rules={[
                          { required: true, message: "" },
                          { max: 16, message: "only 16 characters allowed" },
                          {
                            min: 10,
                            message: "minimun 10 characters required",
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
                          { required: true, message: "" },
                          { max: 16, message: "only 16 characters allowed" },
                          {
                            min: 10,
                            message: "minimun 10 characters required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </td>
                    {/* <td style={{ width: 10 }}>
                      <Button
                        type="link"
                        onClick={() => {
                          console.log(props?.data[key]);
                        }}
                      >
                        <MdEditSquare />
                      </Button>
                    </td> */}
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

        <Col sm={3}></Col>
        <Col sm={3}>
          <Form.Item>
            <Button
              size="large"
              block
              type="primary"
              htmlType="submit"
              loading={props?.loadingVariant}
            >
              Add New Variants
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default VariantFormUpdate;
