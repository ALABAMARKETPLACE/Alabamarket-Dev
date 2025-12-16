"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { SlInfo } from "react-icons/sl";
import API from "../../../../config/API";
import { GET, POST } from "../../../../util/apicall";
import { notification } from "antd";
import Step1 from "./_components/step1";
import Step2 from "./_components/step2";

function Page() {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useRouter();

  useEffect(() => {
    loadStates();
  }, []);

  const moveToNextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  const goBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const loadStates = async () => {
    try {
      let url = API.STATES;
      let response: any = await GET(url);
      if (response.status) {
        setStates(response.data);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const register = async (obj: any) => {
    try {
      setLoading(true);
      let url = API.INDIVIDUAL_STORE_CREATE;
      const response: any = await POST(url, obj);
      if (response.status) {
        notification.success({
          message: "Success",
          description: "successful",
        });
      } else {
        notification.error({
          message: "Registration Failed",
          description: " Please try again.",
        });
      }
    } catch (err: any) {
      console.error("API Error:", err);
      notification.error({
        message: "Something went wrong!",
        description: err.message,
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
            {currentStep === 1 ? (
              <h4 className="sellerRegister-Heading">
                Congratulations! Application registered successfully.
              </h4>
            ) : (
              <h4 className="sellerRegister-Heading">Register your request</h4>
            )}
          </div>
          <button
            style={{ border: "none", backgroundColor: "transparent" }}
            onClick={() => navigation.push("/seller/individual_info")}
          >
            <SlInfo size={20} />
          </button>
        </div>
        <hr />
        {currentStep === 0 && (
          <Step1
            register={register}
            loading={loading}
            states={states}
            moveToNextStep={moveToNextStep}
            goBack={goBack}
          />
        )}
        {currentStep === 1 && <Step2 loading={loading} goBack={goBack} />}
      </Container>
    </div>
  );
}

export default Page;
