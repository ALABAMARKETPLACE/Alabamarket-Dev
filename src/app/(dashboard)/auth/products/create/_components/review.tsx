import { Button, Card, Collapse, Image, Tag } from "antd";
import React, { useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import Meta from "antd/es/card/Meta";
import { reduxSettings } from "@/redux/slice/settingsSlice";

function ProductReview({
  details,
  coverImage,
  images,
  variants,
  back,
  onFinish,
  loading,
}: {
  details: Record<string, any>;
  coverImage: any;
  images: any[];
  variants: any;
  back: Function;
  onFinish: Function;
  loading: boolean;
}) {
  const Category = useSelector(reduxCategoryItems);
  const Settings = useSelector(reduxSettings);
  const categ = useMemo(() => {
    if (!Array.isArray(Category)) {
      return null;
    }
    return Category?.find((item: any) => item.id == details?.category);
  }, [Category]);
  const subcateg = useMemo(() => {
    if (!Array.isArray(categ?.sub_categories)) {
      return null;
    }
    return categ?.sub_categories?.find(
      (item: any) => item?._id == details?.subCategory
    );
  }, [categ]);

  console.log(variants);
  return (
    <div style={{ minHeight: "64vh" }}>
      <Collapse defaultActiveKey={["4"]} bordered={false}>
        <Collapse.Panel header="Product Information" key="1">
          <Row>
            {details
              ? Object.keys(details).map((item: any) => (
                  <React.Fragment key={item}>
                    <Col className="col-6">{item}</Col>
                    <Col className="col-6">
                      :{" "}
                      {item == "category"
                        ? categ?.name ?? String(details[item])
                        : item == "subCategory"
                        ? subcateg?.name ?? String(details[item])
                        : String(details[item])}
                    </Col>
                  </React.Fragment>
                ))
              : null}
          </Row>
        </Collapse.Panel>
        <Collapse.Panel header="Product Images" key="2">
          <Row>
            <Col className="col-md-3">
              <Image
                width={"100%"}
                src={coverImage?.url?.Location ?? coverImage?.url}
              />
            </Col>
            {Array.isArray(images)
              ? images.map((item: any, index: number) => (
                  <Col className="col-md-3" key={index}>
                    <Image
                      width={"100%"}
                      src={item?.url?.Location ?? item?.file?.url}
                    />
                  </Col>
                ))
              : null}
          </Row>
        </Collapse.Panel>
        <Collapse.Panel header="Product Variants" key="3">
          <Row>
            {Array.isArray(variants?.variants) ? (
              variants?.variants?.map((item: any) => (
                <Col md="2">
                  <Card
                    hoverable
                    style={{ width: "100%" }}
                    cover={
                      <img
                        alt="product variants"
                        src={item?.image?.url?.Location ?? item?.image?.url}
                        style={{ height: "10rem", objectFit: "cover" }}
                      />
                    }
                  >
                    <Meta
                      title={`${item?.price} ${Settings?.currency ?? ""}`}
                      description={
                        <div>
                          {Array.isArray(item?.combination) == true ? (
                            <div>
                              {item?.combination?.map((item: any) => {
                                return (
                                  <Tag bordered={false}>
                                    <span>{`${item.variant}: ${item?.value} `}</span>
                                  </Tag>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-secondary">No Variants has been Added.</p>
            )}
          </Row>
        </Collapse.Panel>
      </Collapse>
      <div className="row mt-3">
        <div className="col-md-6"></div>
        <div className="col-md-2">
          <Button size="large" block onClick={() => back()}>
            Back
          </Button>
        </div>
        <div className="col-md-4">
          <Button
            type="primary"
            size="large"
            block
            onClick={() => onFinish()}
            loading={loading}
          >
            Continue{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductReview;
