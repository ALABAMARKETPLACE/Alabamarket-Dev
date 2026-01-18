"use client";
import { Button, Form, Popconfirm, Tag, message, notification } from "antd";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "../style.scss";
import EditModal from "./_components/editModal";
import EditEmail from "./_components/editEmail";
import EditName from "./_components/editName";
import PhoneVerifyOtp from "./_components/phoneVerify";
import DeactivateModal from "./_components/deactivateModal";
import EditProfilePhoto from "./_components/editProfilePhoto";
import EditPassword from "./_components/updatePassword";
import EmailVerificationModal from "./_components/emailVerficationModal";
import EditNameChange from "./_components/editNameChange";
import EditEmailChange from "./_components/editEmailChange";
import EditMobilenumberChange from "./_components/editMobilenumberChange";
import EditPasswordChange from "./_components/editPasswordChange";
import API from "@/config/API";
import { GET, PUT } from "@/util/apicall";
import { signOut, useSession } from "next-auth/react";
import Loading from "@/app/(dashboard)/_components/loading";
import { Collapse } from "antd";

const ProfileDashboard = () => {
  const { data: session, update }: any = useSession();
  const User = session?.user;
  const [userDetails, setUserDetails] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [modal3, setModal3] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailopen, setEmailopen] = useState(false);
  const [numberopen, setNumberopen] = useState(false);
  const [passwordopen, setPasswordopen] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordType, setPasswordType] = useState<"add" | "update">("update");
  const [notificationApi, contextHolder] = notification.useNotification();
  const [verifyEmailModalVisible, setVerifyEmailModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const { Panel } = Collapse;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleeditcancel = () => {
    setModal(false);
    setModal1(false);
    setModal2(false);
    setModal3(false);
    setPasswordModal(false);
  };
  useEffect(() => {
    getUserDetails();
  }, []);
  const getUserDetails = async () => {
    setLoading(true);
    try {
      let url = API.USER_REFRESH;
      const response: any = await GET(url);
      if (response?.status) {
        setUserDetails(response?.data);
      } else {
        message.error("Failed to fetch users detais.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  // Deactivation modal--------------

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const openVerifyEmailModal = () => {
    setVerifyEmailModalVisible(true);
  };

  const closeVerifyEmailModal = () => {
    setVerifyEmailModalVisible(false);
  };
  const updateEmail = async (values: any) => {
    try {
      const { email } = values;
      const obj = {
        email,
      };
      setEmailLoading(true);
      const url = API.USER_EMAIL_UPDATE;
      const Response: any = await PUT(url, obj);
      if (Response.status) {
        await update({
          user: {
            ...session?.user,
            email,
            mail_verify: false,
          },
        });
        notificationApi.success({ message: "Email Updated Successfully" });
        setEmailopen(false);
      } else {
        notificationApi.error({ message: Response.message });
      }
    } catch (error) {
      notificationApi.error({ message: "Something went wrong." });
    } finally {
      setEmailLoading(false);
    }
  };
  const updateName = async (values: any) => {
    try {
      const { first_name, last_name } = values;
      const obj = {
        first_name,
        last_name,
      };
      const url = API.USER_NAME_UPDATE;
      setEmailLoading(true);
      const Response: any = await PUT(url, obj);
      if (Response.status) {
        await update({
          user: {
            ...session?.user,
            first_name,
            last_name,
            name: `${first_name} ${last_name}`,
          },
        });
        notificationApi.success({ message: "Successfully Updated your Name" });
        setOpen(false);
      } else {
        notificationApi.error({ message: Response.message ?? "" });
      }
    } catch (error) {
      notificationApi.error({ message: "Something went wrong." });
    } finally {
      setEmailLoading(false);
    }
  };

  const editPassowrd = async (values: any) => {
    const url =
      passwordType == "update"
        ? API.USER_CHANGE_PASSWORD
        : passwordType == "add"
        ? API.USER_ADDNEW_PASSWORD
        : "";
    try {
      setPasswordLoading(true);
      const response: any = await PUT(url, values);
      if (response?.status) {
        getUserDetails();
        notificationApi.success({ message: `Password updated successfully.` });
        setPasswordopen(false);
      } else {
        notificationApi.error({ message: response.message });
      }
    } catch (error: any) {
      notificationApi.error({
        message: "Something went wrong. please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  async function signoutFromAll() {
    try {
      const response: any = await GET(API.USER_LOGOUTALL);
      if (response?.status) {
        notificationApi.success({
          message: response?.message,
        });
        setTimeout(() => {
          signOut();
        }, 1500);
      }
    } catch (err) {
      notificationApi.error({
        message: "Something went wrong. please try again.",
      });
    }
  }
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          {contextHolder}
          <div className="profile-header">
            <div className="profile-txt1">My Account</div>
          </div>
          <Form>
            <Row className="mt-md-3">
              <div className="profile-dashboard-Box1">
                <div className="profile-dashboard-txt5">User Name</div>
              </div>
              <Col md={8}>
                <div className="profile-dashboard-Box5">{User?.user_name}</div>
              </Col>
              <Col md={2}></Col>
              <br />
              <Col md={2}></Col>
            </Row>
            <hr className="profile" />
            <Row>
              <div className="profile-dashboard-Box1">
                <div className="profile-dashboard-txt5">Name</div>
              </div>
              <Col md={8}>
                <div className="profile-dashboard-Box5">
                  {User?.first_name}
                  &nbsp;
                  {User?.last_name}
                </div>
                <div className="profile-dashboard-input1">
                  {open ? (
                    <EditNameChange
                      firstname={User?.first_name}
                      lastname={User?.last_name}
                      updateName={updateName}
                      loading={emailLoading}
                    />
                  ) : null}
                </div>
              </Col>
              <Col md={2}></Col>
              <br />
              <Col md={2}>
                <div
                  className="profile-edit-btn"
                  onClick={() => {
                    setOpen(open === false ? true : false);
                  }}
                >
                  {open ? "Cancel" : "Edit"}
                </div>
              </Col>
            </Row>
            <hr className="profile" />

            <Row>
              <div className="profile-dashboard-txt5">Email Address</div>
              <br />
              <Col md={8}>
                <div className="profile-dashboard-Box5">
                  {User?.email || ""}
                </div>
                <div className="profile-dashboard-input1">
                  {emailopen ? (
                    <EditEmailChange
                      email={User?.email}
                      updateEmail={updateEmail}
                      loading={emailLoading}
                    />
                  ) : null}
                </div>
              </Col>
              <Col md={2}>
                {User?.email ? (
                  User?.mail_verify || userDetails?.mail_verify ? (
                    <Tag color="green" bordered={false}>
                      Verified
                    </Tag>
                  ) : (
                    <div>
                      <Tag
                        color="orange"
                        bordered={false}
                        onClick={openVerifyEmailModal}
                        style={{ cursor: "pointer" }}
                      >
                        Verify
                      </Tag>
                    </div>
                  )
                ) : null}
              </Col>

              <Col md={2}>
                <div
                  className="profile-edit-btn"
                  onClick={() => {
                    setEmailopen(emailopen === false ? true : false);
                  }}
                >
                  {emailopen ? "Cancel" : "Edit"}
                </div>
              </Col>
            </Row>
            <hr className="profile" />
            <Row>
              <div className="profile-dashboard-Box1">
                <div className="profile-dashboard-txt5">Mobile Number</div>
                <br />
              </div>
              <Col md={8}>
                <div className="profile-dashboard-Box5">
                  {User?.phone ? (
                    <>
                      {User?.countrycode} {User?.phone}
                    </>
                  ) : null}
                </div>
                <div className="profile-dashboard-input1">
                  &nbsp; &nbsp; &nbsp;
                  {numberopen ? (
                    <EditMobilenumberChange phone={User?.phone} />
                  ) : null}
                </div>
              </Col>
              <Col md={2}>
                {User?.phone ? (
                  User?.phone_verify || userDetails?.phone_verify ? (
                    <Tag color="green" bordered={false}>
                      Verified
                    </Tag>
                  ) : (
                    <Tag color="red" bordered={false}>
                      Not Verified
                    </Tag>
                  )
                ) : null}
              </Col>

              <Col md={2}>
                <div
                  className="profile-edit-btn"
                  onClick={() => {
                    setNumberopen(numberopen === false ? true : false);
                  }}
                >
                  {/* {User?.phone ? "Edit" : "Add"} */}
                  {numberopen ? "Cancel" : "Edit"}
                </div>
              </Col>
            </Row>
            <hr className="profile" />
            <Row>
              <div className="profile-dashboard-Box1">
                <div className="profile-dashboard-txt5">Password</div>
                <br />
              </div>
              <Col md={10}>
                <div className="profile-dashboard-Box5">
                  <div>{User?.password ? "********" : ""}</div>
                </div>
                <div className="profile-dashboard-input1">
                  {passwordopen ? (
                    <EditPasswordChange
                      type={passwordType}
                      closePassword={() => setPasswordopen(false)}
                      loading={passwordLoading}
                      editPassowrd={editPassowrd}
                    />
                  ) : null}
                </div>
              </Col>

              <Col md={2}>
                <div
                  className="profile-edit-btn"
                  onClick={() => {
                    if (User?.password) {
                      setPasswordType("update");
                    } else {
                      setPasswordType("add");
                    }
                    setPasswordopen(passwordopen === false ? true : false);
                  }}
                >
                  {/* {User?.password ? "Edit" : "Add"} */}
                  {passwordopen ? "Cancel" : "Edit"}
                </div>
              </Col>
            </Row>
            <hr className="profile" />
          </Form>

          {/* <div>
        <div className="profile-dashboard-txt6">FAQs</div>
        <br />
        <p className="profile-dashboard-txt7">
          What happens when I update my email address (or mobile number)?
        </p>
        <p className="profile-dashboard-txt8">
          Your login email id (or mobile number) changes, likewise. You'll
          receive all your account related communication on your updated email
          address (or mobile number).
        </p>
        <p className="profile-dashboard-txt7">
          When will my {API.NAME} account be updated with the new email address
          (or mobile number)?
        </p>
        <p className="profile-dashboard-txt8">
          It happens as soon as you confirm the verification code sent to your
          email (or mobile) and save the changes.
        </p>
        <p className="profile-dashboard-txt7">
          What happens to my existing {API.NAME} account when I update my email
          address (or mobile number)?
        </p>
        <p className="profile-dashboard-txt8">
          Updating your email address (or mobile number) doesn't invalidate your
          account. Your account remains fully functional. You'll continue seeing
          your Order history, saved information and personal details.
        </p>
        <p className="profile-dashboard-txt7">
          Does my Seller account get affected when I update my email address?
        </p>
        <p className="profile-dashboard-txt8">
          {API.NAME} has a 'single sign-on' policy. Any changes will reflect in
          your Seller account also.
        </p>
        <br />
      </div>
       */}
          <div>
            <div className="profile-dashboard-txt6">FAQs</div>
            <br />
            <Collapse accordion>
              <Panel
                header="What happens when I update my email address (or mobile number)?"
                key="1"
              >
                <p>
                  Your login email id (or mobile number) changes, likewise.
                  You'll receive all your account-related communication on your
                  updated email address (or mobile number).
                </p>
              </Panel>
              <Panel
                header={`When will my ${API.NAME} account be updated with the new email address (or mobile number)?`}
                key="2"
              >
                <p>
                  It happens as soon as you confirm the verification code sent
                  to your email (or mobile) and save the changes.
                </p>
              </Panel>
              <Panel
                header={`What happens to my existing ${API.NAME} account when I update my email address (or mobile number)?`}
                key="3"
              >
                <p>
                  Updating your email address (or mobile number) doesn't
                  invalidate your account. Your account remains fully
                  functional. You'll continue seeing your Order history, saved
                  information, and personal details.
                </p>
              </Panel>
              <Panel
                header={`Does my Seller account get affected when I update my email address?`}
                key="4"
              >
                <p>
                  {`${API.NAME} has a 'single sign-on' policy. Any changes will reflect in
            your Seller account also.`}
                </p>
              </Panel>
            </Collapse>
          </div>
          <br />
          <div className="d-md-flex gap-2">
            <Button className="profile-dashboard-txt9" onClick={showModal}>
              Deactivate Account
            </Button>
            <Popconfirm
              placement="bottomRight"
              title={"You will be signed out from all devices including this."}
              okText="Yes"
              cancelText="No"
              onConfirm={signoutFromAll}
            >
              <Button className="profile-dashboard-txt9">
                Signout from all Devices
              </Button>
            </Popconfirm>
          </div>
          <br />
          {modal ? (
            <EditModal
              ui={<EditEmail close={handleeditcancel} />}
              open={modal}
              close={handleeditcancel}
            />
          ) : null}
          {modal1 ? (
            <EditModal
              ui={<EditName close={handleeditcancel} />}
              open={modal1}
              close={handleeditcancel}
            />
          ) : null}
          {modal2 ? (
            <EditModal
              ui={<PhoneVerifyOtp close={handleeditcancel} />}
              open={modal2}
              close={handleeditcancel}
            />
          ) : null}
          <EditModal
            ui={<EditPassword close={handleeditcancel} type={passwordType} />}
            open={passwordModal}
            close={handleeditcancel}
          />
          {modal3 ? (
            <EditProfilePhoto open={modal3} close={handleeditcancel} />
          ) : null}
          <DeactivateModal open={isModalOpen} cancelModal={handleCancel} />
          <EmailVerificationModal
            visible={verifyEmailModalVisible}
            onClose={closeVerifyEmailModal}
          />
        </div>
      )}
    </>
  );
};

export default ProfileDashboard;
