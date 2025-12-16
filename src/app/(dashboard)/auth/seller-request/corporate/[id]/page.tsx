"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Card } from "antd";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import moment from "moment";
import RequestDocument from "../_components/request_modal";
import ApproveModal from "../_components/approve_modal";

function CorporateSeller() {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const {
    data: seller,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ signal }) => GET(API.STORE_INFO_ADMIN + params?.id, {}, signal),
    queryKey: ["admin_corporate_seller_details", params?.id],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return [];
    },
  });
  const business_details: any = {
    "Business Location": seller?.business_location,
    "Business Address": seller?.business_address,
    "Business Type": seller?.business_address,
    "Business Registration Number": seller?.trn_number,
    "Union Membership Number": seller?.trade_lisc_no,
    "Business Registration Document": seller?.trn_upload,
  };
  const seller_details: any = {
    "Seller Name": seller?.seller_name,
    Country: seller?.seller_country,
    "Birth Country": seller?.birth_country,
    Dob: moment(seller?.dob).format("MM/DD/YYYY"),
    "ID Type": seller?.id_type,
    "ID Proof": seller?.id_proof,
    "ID Issue Country": seller?.id_issue_country,
    "ID Expiry Date": moment(seller?.id_expiry_date).format("MM/DD/YYYY"),
  };

  const store_details: any = {
    "Store Name": seller?.store_name,
    UPSCS: seller?.upscs,
    Manufacture: seller?.manufacture,
    Status: seller?.status,
    "Opening Time": seller?.from,
    "Closing Time": seller?.to,
  };

  // Fetch subscription plan details by id to show per-day price and product limits
  const { data: planDetails } = useQuery({
    enabled: !!seller?.subscription_plan_id,
    queryKey: ["subscription-plan", seller?.subscription_plan_id],
    queryFn: ({ signal }) =>
      GET(
        API.SUBSCRIPTION_PLANS + String(seller?.subscription_plan_id),
        {},
        signal
      ),
    select: (res: any) => (res?.status ? res?.data : null),
  });

  const subscription_details: any = {
    "Subscription Plan":
      seller?.subscription_plan_name ||
      planDetails?.name ||
      seller?.subscription_plan ||
      "Standard Seller",
    "Daily Price":
      planDetails?.price_per_day !== undefined
        ? `₦${Number(planDetails?.price_per_day).toLocaleString()} / day`
        : seller?.subscription_price !== undefined
        ? `₦${Number(seller?.subscription_price).toLocaleString()} / day`
        : "Free",
    Products: planDetails?.max_products
      ? `You can boost ${planDetails?.max_products} products in this plan.`
      : seller?.subscription_boosts === -1
      ? "Unlimited product boosts"
      : seller?.subscription_boosts > 0
      ? `You can boost ${seller?.subscription_boosts} products per month`
      : "No product boosts",
  };

  const dates: any = {
    "Submited Date": moment(seller?.createdAt).format("MM/DD/YYYY"),
  };

  const handleDownload = (imageUrl: any) => {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([blob]));
        link.download = "downloaded_file.jpg";
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading the file:", error);
      });
  };
  return (
    <>
      <PageHeader
        title={"Seller Request Corporate"}
        bredcume={"Dashboard / Seller Requests / Corporate"}
      >
        <Button type="primary" ghost onClick={() => setOpen(true)}>
          Request Document
        </Button>
        <Button type="primary" onClick={() => setOpen2(true)}>
          Approve/Reject
        </Button>
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <>
          <Card
            title={
              <div className="d-flex justify-content-between">
                Contact Details <Button type="dashed">Call</Button>
              </div>
            }
            bordered={false}
          >
            <span className="fw-bold">{seller?.name}</span> <br />
            <span className="">{seller?.email}</span> <br />
            <span className="">
              {seller?.code} {seller?.phone}
            </span>
          </Card>
          <div className="row py-3 gy-3">
            <div className="col-md-6">
              <Card
                title={"Business Details"}
                bordered={false}
                className="h-100"
              >
                {Object.keys(business_details).map((item, key) => (
                  <div
                    className="d-flex justify-content-between pb-2"
                    key={key}
                  >
                    <span className="fw-bold">{item}:</span>
                    {item === "ID Proof" ||
                    item === "Business Registration Document" ? (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleDownload(business_details[item])}
                      >
                        Download
                      </Button>
                    ) : (
                      <span>{business_details[item]}</span>
                    )}
                  </div>
                ))}
              </Card>
            </div>
            <div className="col-md-6">
              <Card title={"Seller Details"} bordered={false} className="h-100">
                {Object.keys(seller_details).map((item, key) => (
                  <div
                    className="d-flex justify-content-between pb-2"
                    key={key}
                  >
                    <span className="fw-bold">{item}:</span>
                    {item === "ID Proof" ||
                    item === "Business Registration Document" ? (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleDownload(seller_details[item])}
                      >
                        Download
                      </Button>
                    ) : (
                      <span>{seller_details[item]}</span>
                    )}
                  </div>
                ))}
              </Card>
            </div>
            <div className="col-md-6">
              <Card title={"Store Details"} bordered={false} className="h-100">
                {Object.keys(store_details).map((item, key) => (
                  <div
                    className="d-flex justify-content-between pb-2"
                    key={key}
                  >
                    <span className="fw-bold">{item}:</span>
                    <span>{store_details[item]}</span>
                  </div>
                ))}
              </Card>
            </div>
            <div className="col-md-6">
              <Card
                title={"Subscription Plan"}
                bordered={false}
                className="h-100"
              >
                {Object.keys(subscription_details).map((item, key) => (
                  <div
                    className="d-flex justify-content-between pb-2"
                    key={key}
                  >
                    <span className="fw-bold">{item}:</span>
                    <span
                      style={{
                        fontWeight: item === "Subscription Plan" ? 600 : 400,
                        color:
                          item === "Subscription Plan" ? "#1890ff" : "inherit",
                      }}
                    >
                      {subscription_details[item]}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
            <div className="col-md-6">
              <Card title={"Date"} bordered={false} className="h-100">
                {Object.keys(dates).map((item, key) => (
                  <div
                    className="d-flex justify-content-between pb-2"
                    key={key}
                  >
                    <span className="fw-bold">{item}:</span>
                    <span>{dates[item]}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
          <RequestDocument
            open={open}
            close={() => setOpen(false)}
            data={seller}
          />
          <ApproveModal
            open={open2}
            data={seller}
            close={() => setOpen2(false)}
          />
        </>
      )}
    </>
  );
}

export default CorporateSeller;
