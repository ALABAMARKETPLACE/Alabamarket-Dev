import { Button, Space } from "antd";
import React from "react";
import { FaBoxOpen } from "react-icons/fa";
import "./styles.scss";

const NoData = (props: any) => {
  return (
    <div className="noData">
      <div className=""></div>
      {props.icon ? (
        <div className="noData-icon">{props.icon}</div>
      ) : (
        <FaBoxOpen size={70} color="#e6e6e6" />
      )}
      <div className="noData-txt1">{props.header}</div>
      {props.text1 ? <div className="noData-txt2">{props.text1}</div> : null}
      <br />
      <br />
      {props.button ? (
          <Button
            type="default"
            size="large"
            style={{color:"grey"}}
            onClick={() => {
              if (typeof props?.onclick == "function") {
                props?.onclick();
              }
            }}
          >
            {props.button}
          </Button>
      ) : null}
    </div>
  );
};

export default NoData;

// Usage ----->
// ----------------------
// <NoData
//   icon={<FaBoxOpen size={70} color="#e6e6e6" />}
//   header="No Orders Found"
//   text1={`You have no orders. Please start shopping and place orders`}
//   button={"START SHOPPING NOW"}
// />
