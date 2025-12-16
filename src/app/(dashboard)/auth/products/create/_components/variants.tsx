import { useState } from "react";
import { Button, Form, Select, Alert } from "antd";
import { Col, Row } from "react-bootstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
// import VariationImg from "../../../assets/images/product-variations.webp";

import AddVariantType from "./variantFiles/addVariantType";
import VariantFromTable from "./variantFiles/variantFromTable";
import React from "react";

function Variants({
  variantform,
  data,
  variantformChange,
  saveData,
  onChange,
  skip,
  onBack,
}: {
  variantform: any;
  data: any;
  variantformChange: Function;
  saveData: Function;
  onChange: Function;
  skip: Function;
  onBack: Function;
}) {
  const [loading, setLoading] = useState(false);
  const [generate, setGenerate] = useState(
    variantform?.variants?.length ? true : false
  );

  const [variants, setVariants] = useState(variantform);
  const [combination, setCombination] = useState(data);
  const generatePairs = async (values: any) => {
    try {
      variantformChange(values);
      setVariants(values);
      generatePair(values);
    } catch (err) {
      console.log("err", err);
    }
  };

  const generatePair = (values: any) => {
    try {
      setLoading(true);
      let arr = values?.variants;
      const combinations: any = [];
      generateCombinations(arr, 0, [], combinations);
      setCombination(combinations);
      saveData(combinations);
      setGenerate(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("err", err);
    }
  };

  function generateCombinations(
    variants: any,
    currentIndex: any = 0,
    currentCombination: any = [],
    combinations: any = []
  ) {
    try {
      if (currentIndex === variants.length) {
        combinations.push({
          combination: [...currentCombination],
          available: "0",
          barcode: "0",
          price: "0",
          sku: null,
          image: {},
        });
        return;
      }
      const currentVariant = variants[currentIndex];
      for (const valueObj of currentVariant.values) {
        const newCombination = [...currentCombination];
        newCombination.push({
          variant: currentVariant.variant,
          value: valueObj.value,
        });
        generateCombinations(
          variants,
          currentIndex + 1,
          newCombination,
          combinations
        );
      }
    } catch (err) {
      console.log("err = = = >", err);
    }
  }

  const submit = (value: any) => {
    onChange(value);
  };

  const Skip = () => {
    variantformChange([]);
    saveData([]);
    skip();
  };

  return (
    <div>
      {generate ? (
        <div>
          <VariantFromTable
            data={combination}
            edit={() => setGenerate(false)}
            onBack={() => onBack()}
            onChange={(value: any) => submit(value)}
          />
        </div>
      ) : (
        <Form
          onFinish={generatePairs}
          initialValues={{ variants: variants?.variants }}
        >
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div className="AddVariantType-box2">
                    <Row style={{ marginBottom: 10 }}>
                      <Col sm={5}>
                        <div className="input-form-label">Option</div>
                        <Form.Item
                          noStyle
                          {...restField}
                          name={[name, "variant"]}
                          rules={[{ required: true, message: "" }]}
                        >
                          <Select style={{ width: "100%" }}>
                            <Select.Option value={"Color"}>Color</Select.Option>
                            <Select.Option value={"Size"}>Size</Select.Option>
                            <Select.Option value={"Material"}>
                              Material
                            </Select.Option>
                            <Select.Option value={"Style"}>Style</Select.Option>
                          </Select>
                        </Form.Item>
                        <div style={{ margin: 5 }} />
                        <div className="input-form-label">Option Value</div>
                        <AddVariantType fieldKey={name} />
                      </Col>
                      <Col sm={6}></Col>
                      <Col sm={1}>
                        <Button type="link" danger onClick={() => remove(name)}>
                          <RiDeleteBin6Line size={18} />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
                <br />
                {fields.length === 0 ? (
                  <div style={{ minHeight: "64vh" }}>
                    <div>
                      <Alert
                        description={
                          <div>
                            For this product, the bulk variations grid has
                            replaced the default variation dropdowns on the
                            single product page. Size and color etc ...
                            <br />
                            <h6>Example:-</h6>
                            {/* <img src={VariationImg} style={{ width: 400 }} /> */}
                          </div>
                        }
                        type="warning"
                        closable
                      />
                    </div>
                  </div>
                ) : null}
                <Row>
                  <Col sm={2}>
                    {fields.length >= 4 ? null : (
                      <Button type="link" onClick={() => add()}>
                        + Add Variant
                      </Button>
                    )}
                  </Col>
                  <Col sm={5}></Col>
                  {fields.length === 0 ? (
                    <>
                      <Col sm={2}>
                        <Button size="large" block onClick={() => onBack()}>
                          Back
                        </Button>
                      </Col>
                      <Col sm={3}>
                        <Button
                          size="large"
                          block
                          onClick={() => Skip()}
                          type="primary"
                        >
                          Skip & Continue
                        </Button>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col sm={1}>
                        <Button onClick={() => onBack()}>Back</Button>
                      </Col>
                      <Col sm={1}>
                        <Button htmlType="reset" danger>
                          Clear
                        </Button>
                      </Col>
                      <Col sm={3}>
                        <Form.Item>
                          <Button block type="primary" htmlType="submit">
                            generate Combination
                          </Button>
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </>
            )}
          </Form.List>
        </Form>
      )}
    </div>
  );
}
export default Variants;
