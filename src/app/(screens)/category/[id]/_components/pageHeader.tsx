"use client";
import React from "react";
import { Col, Row } from "react-bootstrap";
const PageHeader = (props: any) => {
  return (
    <Row className="mx-0">
      <Col sm={6} xs={12} className="ps-md-0">
        <div className="productByCat-PageHeader">
          <div>
            <div className="productByCat-PageHeadertxt1">
              {props?.plain == true
                ? props?.title
                : `Results for "${props?.title}"`}
            </div>
            <div className="productByCat-PageHeadertxt2">
              {`${
                props?.initial === false
                  ? `${`${
                      ((props?.page > props?.meta?.pageCount
                        ? 1
                        : props?.page === 0
                        ? 1
                        : props?.page) -
                        1) *
                        props?.pageSize +
                      props?.count
                    } of ${props?.meta?.itemCount || 0}`} ${
                      props?.type === "multi" ? "Stores" : "Items"
                    }`
                  : ""
              }`}
            </div>
          </div>
        </div>
      </Col>
      <Col sm={6} xs={12}>
        <div className="productByCat-PageHeaderBox">{props?.children}</div>
      </Col>
    </Row>
  );
};

export default PageHeader;
