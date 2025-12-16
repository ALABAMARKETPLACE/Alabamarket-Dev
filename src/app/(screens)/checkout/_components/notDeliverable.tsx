"use client";
import { Modal } from "antd";
import React from "react";
import { FcCancel } from "react-icons/fc";
import notDelivery from "../../../../assets/images/no-trucks.png";
import Image from "next/image";
function NotDeliverableModal(props: any) {
  return (
    <Modal
      title={<div className="text-center">Delivery Not Available</div>}
      centered
      open={props?.open}
      onOk={() => {}}
      onCancel={props?.close}
      footer={false}
    >
      <div className="d-flex justify-content-center">
        {" "}
        <Image src={notDelivery} style={{width:'100px',height:'100px'}} alt="" />
      </div>
      <p className="text-center mt-2">{props?.message ?? ""}</p>
    </Modal>
  );
}

export default NotDeliverableModal;
