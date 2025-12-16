"use client";
import { FcGoogle } from "react-icons/fc";
import { Auth, GoogleProvide } from "@/util/firebaseProvider";
import { signInWithPopup } from "firebase/auth";
import { notification, Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { storeToken } from "@/redux/slice/authSlice";
import { useAppDispatch } from "@/redux/hooks";

const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;

function GmailLogin(props: any) {
  const navigation = useRouter();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const loginGmail = async () => {
    try {
      setLoading(true);
      const info = await signInWithPopup(Auth, GoogleProvide);
      const token = await info?.user?.getIdToken();
      const result: any = await signIn("google", {
        redirect: false,
        idToken: token,
      });
      if (result.ok) {
        const session: any = await getSession();
        dispatch(
          storeToken({
            token: session?.token,
            refreshToken: session?.refreshToken,
          })
        );
        navigation.replace("/auth");
      } else {
        notificationApi.error({
          message: result.error || "something went wrong.",
        });
      }
    } catch (err) {
      notificationApi.error({
        message:
          "Something went wrong.... Unable to complete Gmail login. Please try",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="GmailLogin" onClick={() => loginGmail()}>
        <div className="GmailLogin-row">
          <div>
            <FcGoogle size={30} />
          </div>
          <div>&nbsp;Continue With Google</div>
        </div>
      </div>
      <Modal
        width={250}
        centered
        open={false}
        footer={false}
        closable={false}
        loading={loading}
      >
        <div className="GmailLogin-txt1 d-flex justify-content-center align-items-center">
          <Spin indicator={antIcon} />
          &nbsp; &nbsp; &nbsp;Checking Account . . .
        </div>
      </Modal>
    </>
  );
}
export default GmailLogin;
