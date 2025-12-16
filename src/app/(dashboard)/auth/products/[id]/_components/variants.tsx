import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import { Button, Form, Select, Alert, notification } from "antd";
import useToggle from "@/shared/hook/useToggle";
import AvailableVariants from "./availableVariants";
import { Col, Row } from "react-bootstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddVariantType from "./addVariant";
import VariantFormUpdate from "./variantFormUpdate";
import EditProductVariantModal from "./editVariantModal";
import { COMPRESS_IMAGE, DELETE, POST } from "@/util/apicall";

type UpdateVariantsProps = {
  back?: () => void;
  saveData?: (value: any) => void;
  onContinue?: () => void;
};

function UpdateVariants({ back, saveData, onContinue }: UpdateVariantsProps) {
  const params = useParams();
  const [generate, setGenerate] = useState(false);
  const [variants, setVariants] = useState<any>(null);
  const [combination, setCombination] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState<any>({});
  const [openModal, setToggleModal] = useToggle(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any>({
    queryKey: [API.PRODUCTS_GETONE_STORE + params.id],
    select: (res) => {
      if (res?.status) return res?.data;
      return {};
    },
  });

  const generatePairs = async (values: any) => {
    try {
      setVariants(values);
      generatePair(values);
    } catch (err) {
      console.log("err", err);
    }
  };

  const generatePair = (values: any) => {
    try {
      let arr = values?.variants;
      const combinations: any = [];
      generateCombinations(arr, 0, [], combinations);
      setCombination(combinations);
      saveData?.(combinations);
      setGenerate(true);
    } catch (err) {
      console.log("err", err);
    }
  };
  const reset = () => {
    setGenerate(false);
    setVariants([]);
  };

  function generateCombinations(
    variants: any,
    currentIndex: any = 0,
    currentCombination: any = [],
    combinations: any = []
  ) {
    try {
      if (currentIndex === variants?.length) {
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

  const uploadVariantsImage = async (variant: any[]) => {
    try {
      let arr = [...variant];
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]?.image?.file) {
            let upload = await COMPRESS_IMAGE(arr[i]?.image?.file);
            let obj: any = arr[i];
            obj.image.url = upload;
            arr[i] = obj;
          }
        }
      }
      return arr;
    } catch (err) {
      throw new Error("Failed to upload image");
    }
  };

  const deleteVariant = useMutation({
    mutationFn: (id: number) => DELETE(API.PRODUCT_VARIANT_DELETE + id),
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Variant Removed Successfully`,
      });
      refetch();
    },
  });

  const addVariant = useMutation({
    mutationFn: async (body: any) => {
      if (Array.isArray(body?.variants)) {
        const variantsData = await uploadVariantsImage(body?.variants);
        const obj = {
          data: variantsData,
          name: product?.name,
          productId: params.id,
        };
        return await POST(API.PRODUCT_VARIANT_ADD, obj);
      }
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Variants Added Successfully`,
      });
      refetch();
    },
  });
  return (
    <div className="product-update-section">
      {contextHolder}
      {product?.productVariant?.length ? (
        <>
          <h5>Available Variants</h5>
          <AvailableVariants
            data={product?.productVariant}
            edit={() => {
              setGenerate(false);
            }}
            onBack={() => back?.()}
            onChange={(value: any) => console.log(value)}
            deleteVariant={(v: any) => deleteVariant.mutate(v?.id)}
            loadingVariant={isLoading}
            setSelectedVariant={setSelectedVariant}
            setToggleModal={() => setToggleModal(true)}
          />
        </>
      ) : generate == false ? (
        <Alert
          description={
            <div>
              No Variants are available for this product. click the{" "}
              <b>Add New Variant</b> Button below to add New variants.
            </div>
          }
          type="warning"
          closable
        />
      ) : null}
      {generate ? (
        <>
          <h5>New Variants</h5>
          <VariantFormUpdate
            data={combination}
            edit={() => {
              setGenerate(false);
            }}
            onBack={() => back?.()}
            onChange={(value: any) => addVariant.mutate(value)}
            loadingVariant={addVariant.isPending}
            available={product?.productVariant?.length}
            clearForm={() => {}}
          />
        </>
      ) : (
        <Form
          onFinish={generatePairs}
          initialValues={{ variants: variants?.variants }}
          className="mt-2"
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

                <Row>
                  <Col sm={2}>
                    {fields?.length >= 4 ? null : (
                      <Button type="link" onClick={() => add()}>
                        + Add New Variant
                      </Button>
                    )}
                  </Col>
                  <Col sm={5}></Col>
                  {fields?.length === 0 ? (
                    <>
                      <Col sm={2}></Col>
                      <Col sm={3}></Col>
                    </>
                  ) : (
                    <>
                      <Col sm={1}></Col>
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
      <EditProductVariantModal
        selectedVariant={selectedVariant}
        openModal={openModal}
        closeModal={() => setToggleModal(false)}
        product={product}
        getProductDetails={refetch}
      />
      <div className="product-update-actions mt-4">
        <Button
          size="large"
          block
          onClick={() => back?.()}
          className="product-update-actions__btn"
        >
          Back
        </Button>
        <Button
          size="large"
          block
          onClick={() => onContinue?.()}
          className="product-update-actions__btn"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default UpdateVariants;
