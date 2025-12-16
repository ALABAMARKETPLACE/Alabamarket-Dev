import React from "react";
import Loading from "@/app/(dashboard)/_components/loading";
import moment from "moment";
import { Avatar, Button, Card } from "antd";
import Error from "@/app/(dashboard)/_components/error";
interface props {
  seller: Record<string, any>;
  isLoading: boolean;
  isError: boolean;
  error: Record<string, any> | null;
}

function Details({ error, seller, isLoading, isError }: props) {
  console.log("sellerrrrr",seller);
  const business_details: any = {
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
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
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
            <div className="d-flex gap-3">
              <Avatar size={64} src={seller?.logo_upload} shape="square" />
              <div>
                <span className="fw-bold">{seller?.name}</span> <br />
                <span className="">{seller?.email}</span> <br />
                <span className="">
                  {seller?.code} {seller?.phone}
                </span>
              </div>
            </div>
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
                    {item === "ID Proof" || item === "Business Registration Document" ? (
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
                    {item === "ID Proof" || item === "Business Registration Document" ? (
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
        </>
      )}
    </>
  );
}

export default Details;
