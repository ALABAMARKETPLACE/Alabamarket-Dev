"use client";
import { notification, Steps } from "antd";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Step } from "rc-steps";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import API from "../../../../config/API";
import { DOCUMENT_UPLOAD, GET, POST } from "../../../../util/apicall";
import Step1 from "./_components/step1";
import Step2 from "./_components/step2";
import Step3 from "./_components/step3";
import Step4 from "./_components/step4";
import Step5 from "./_components/step5";

function Page() {
  const navigation = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, SetSuccess] = useState(false);
  const { data: User }: any = useSession();
  const userId = User?._id;
  const [businessType, SetBusinessType] = useState([]);
  const [formData, setFormData] = useState({
    step1Data: {},
    step2Data: {},
    step3Data: {},
    step4Data: {},
  } as any);

  let phone = `${formData.step1Data?.code}${formData.step1Data?.phone}`;
  useEffect(() => {
    loadbusinessType();
  }, []);

  const loadbusinessType = async () => {
    try {
      let url = API.BUSINESS_TYPE;
      let response: any = await GET(url);
      if (response.status) {
        SetBusinessType(response.data);
      }
    } catch (err) {}
  };

  const moveToNextStep = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  const goBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  const register = async (token: string) => {
    try {
      //uploading id proof and trn file.
      setLoading(true);
      const id_proof_upload = await DOCUMENT_UPLOAD(
        formData?.step4Data?.id_proof?.file
      );
      const trn_upload = await DOCUMENT_UPLOAD(
        formData?.step4Data?.trn_upload?.file
      );
      let obj = {
        //step1
        first_name: formData?.step1Data?.first_name,
        last_name: formData?.step1Data?.last_name,
        name: `${formData?.step1Data?.first_name} ${formData?.step1Data?.last_name}`,
        email: formData?.step1Data?.email,
        code: formData?.step1Data?.code,
        phone: formData?.step1Data?.phone, // Add phone field
        password: formData?.step1Data?.password,
        //step2
        store_name: formData?.step2Data?.store_name,
        business_address: formData?.step2Data?.business_address,
        business_location: formData?.step2Data?.business_location,
        // business_type: formData?.step2Data?.business_type,
        trn_number: formData?.step2Data?.trn_number,
        trade_lisc_no: formData?.step2Data?.trade_licencse_no,
        upscs: formData?.step2Data?.upscs,
        manufacture: formData?.step2Data?.manufacture,
        agreement: formData?.step2Data?.agreement,
        account_name_or_code: formData?.step2Data?.account_name_or_code,
        account_number: formData?.step2Data?.account_number,
        settlement_bank: formData?.step2Data?.settlement_bank,
        settlement_account_number: formData?.step2Data?.account_number,
        settlement_account_name: formData?.step2Data?.account_name_or_code,
        lat: formData?.step2Data?.lat,
        long: formData?.step2Data?.long,
        //step3
        seller_name: formData?.step3Data?.seller_name,
        seller_country: formData?.step3Data?.citizenship_country,
        birth_country: formData?.step3Data?.birth_country,
        dob: formData?.step3Data?.dob,
        id_issue_country: formData?.step3Data?.issue_country,
        id_expiry_date: formData?.step3Data?.expiry_date,
        id_type: formData?.step3Data?.id_type,
        //step4
        id_proof: id_proof_upload,
        trn_upload: trn_upload,
        subscription_plan_id: formData?.step4Data?.subscription_plan_id || null,
        subscription_plan: formData?.step4Data?.subscription_plan || "standard",
        subscription_plan_name:
          formData?.step4Data?.subscription_data?.name || "Standard Seller",
        subscription_price: formData?.step4Data?.subscription_data?.price || 0,
        subscription_boosts:
          formData?.step4Data?.subscription_data?.boosts || 0,
        logo_upload: "",
        status: "pending",
        userId: userId,
        idToken: token,
        business_types: formData?.step2Data?.business_types,
      };
      console.log(obj, "objjjjjjj");
      const url = User
        ? API.CORPORATE_STORE_CREATESELLER
        : API.CORPORATE_STORE_CREATE;

      console.log("urllll", url);
      console.log("[SellerRegister] payload:", obj);
      const response: any = await POST(url, obj);
      console.log("resssponnsss", response);
      if (response.status) {
        notification.success({
          message: "Success",
          description: "Seller Registration is successful",
        });
        SetSuccess(true);
        window.scrollTo(0, 0);
      } else {
        notification.error({
          message: response?.message ?? "Something went wrong",
          description: "Please connect support team to slove this issue.",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.response?.data?.message || "Something went wrong!";
      notification.error({
        message: errorMessage,
        description:
          err?.response?.data?.error ||
          "Please connect support team to slove this issue.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="Screen-box">
      <br />
      <Container>
        <div className="sellerRegister-row">
          <div>
            <h4 className="sellerRegister-Heading">
              Create Your Seller Account
            </h4>
          </div>
          <div
            className="sellerRegister-text2"
            style={{ color: "blue" }}
            onClick={() => navigation.push("/seller/individual")}
          >
            Individual
          </div>
        </div>
        <br />
        <Steps className="sellerRegister-steps" current={currentStep}>
          <Step title={"Profile"} description={"Enter email,phone etc..."} />
          <Step title={"Business Info"} description={"Name, Location etc..."} />
          <Step title={"Seller Details"} description={"Owner Details etc..."} />
          <Step
            title={"Upload Documents"}
            description={"ID, Business Registration etc..."}
          />
        </Steps>
        <br />
        <div>
          {currentStep === 0 ? (
            <Step1
              moveToNextStep={moveToNextStep}
              formData={formData.step1Data}
            />
          ) : null}
          {currentStep === 1 && (
            <Step2
              businessType={businessType}
              formData={formData.step2Data}
              moveToNextStep={moveToNextStep}
              goBack={goBack}
            />
          )}
          {currentStep === 2 && (
            <Step3
              moveToNextStep={moveToNextStep}
              goBack={goBack}
              formData={formData.step3Data}
            />
          )}
          {currentStep === 3 && (
            <Step4
              moveToNextStep={moveToNextStep}
              goBack={goBack}
              formData={formData.step4Data}
            />
          )}
          {currentStep === 4 && (
            <Step5
              loading={loading}
              success={success}
              phoneNumber={phone}
              formData={formData}
              register={register}
              goBack={goBack}
            />
          )}
        </div>
      </Container>
      <br />
    </div>
  );
}

export default Page;
