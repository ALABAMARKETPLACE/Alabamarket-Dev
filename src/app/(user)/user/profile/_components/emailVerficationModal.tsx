"use client";
import API from "@/config/API";
import { POST } from "@/util/apicall";
import { Modal, Button, Input, message, Spin } from "antd";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const EmailVerificationModal = (props: any) => {
  const { data: session }: any = useSession();
  const User = session?.user;
    const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response: any = await POST(API.USER_EMAIL_VERIFY, {});
      if (response?.status) {
        messageApi.success(
          `Verification mail sent successfully. Check your mailbox`
        );
        props?.onClose();
      } else {
        messageApi.error(response?.message ?? "");
      }
    } catch (error) {
      messageApi.error(`something went wrong!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Verify Email"
        open={props?.visible}
        onCancel={props?.onClose}
        centered
        footer={[
          <Button key="cancel" onClick={props?.onClose}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={sendVerificationEmail}
            disabled={loading}
            loading={loading}
          >
            Send Verification Link
          </Button>,
        ]}
      >
        <p>
          a verification link will be sent to the below email. valid for only 5
          mins
        </p>
        <Input
          value={User?.data?.email}
          // onChange={(e) => setEmailToVerify(e.target.value)}
          disabled
        />
      </Modal>
    </>
  );
};

export default EmailVerificationModal;
