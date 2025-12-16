import { Skeleton } from "antd";
import React, { useMemo } from "react";
import { Col, Row } from "react-bootstrap";
function generateNumberArray(limit: number) {
  const result = [];
  for (let i = 1; i <= limit; i++) {
    result.push(i);
  }
  return result;
}
function SkelotonProductLoading(props: any) {
  let count = 6;
  if (typeof props?.count == "number") {
    count = props?.count;
  }
  const data = useMemo(() => {
    return generateNumberArray(count);
  }, [count]);

  return (
    <Row className="mx-0 mt-2 gy-2">
      {data.map((item, index: number) => {
        return (
          <Col
            lg="2"
            sm="4"
            className="ps-md-0 col-6 product-card-searchstore"
            key={index}
          >
            <Skeleton.Button
              key={item}
              active={true}
              size={"large"}
              shape={"square"}
              block={true}
              style={{ height: "220px", width: "100%", marginRight: 10 }}
            ></Skeleton.Button>
          </Col>
        );
      })}
    </Row>
  );
}

export default SkelotonProductLoading;
