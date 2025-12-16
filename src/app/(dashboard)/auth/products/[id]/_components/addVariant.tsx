import { Form, Input } from "antd";
import { Row, Col } from "react-bootstrap";
import { IoClose } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import React from "react";
const AddVariantType = (props: any) => {
  return (
    <Form.List
      name={[props.fieldKey, "values"]}
      initialValue={[{ value: null }]}
    >
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => (
            <Row>
              <Col sm={12}>
                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Input
                    addonAfter={
                      fields.length === index + 1 ? (
                        <div onClick={() => add()}>
                          <IoMdAdd color="green" size={20} />
                        </div>
                      ) : (
                        <div onClick={() => remove(name)}>
                          <IoClose color="red" size={20} />
                        </div>
                      )
                    }
                  />
                </Form.Item>
              </Col>
              <Col sm={2}>
                <div className="AddVariantType-box"></div>
              </Col>
            </Row>
          ))}
        </>
      )}
    </Form.List>
  );
};

export default AddVariantType;
