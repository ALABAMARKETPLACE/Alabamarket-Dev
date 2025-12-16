import React from "react";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { Card, Descriptions } from "antd";
import { useQuery } from "@tanstack/react-query";

function UserAddress() {
  const params = useParams();
  const {
    data: address,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ signal }) => GET(API.ADDRESS_GET + params?.id, {}, signal),
    queryKey: ["admin_user_address", params?.id],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <>
          {Array.isArray(address)
            ? address.map((item, index) => (
                <Card key={index} className="mb-3">
                  <Descriptions
                    layout="horizontal"
                    size="middle"
                    items={[
                      { key: "22", label: "Flat", children: item?.flat },
                      {
                        key: "22",
                        label: "Address",
                        children: item?.fullAddress,
                      },
                      { key: "22", label: "PinCode", children: item?.pin_code },
                      { key: "22", label: "State", children: item?.state },
                      { key: "22", label: "City", children: item?.city },
                      { key: "22", label: "Street", children: item?.street },
                      {
                        key: "22",
                        label: "Phone",
                        children: item?.code + item?.alt_phone,
                      },
                      {
                        key: "22",
                        label: "Type",
                        children: item?.type,
                      },
                    ]}
                    labelStyle={{
                      color: "black",
                      textTransform: "capitalize",
                      fontWeight: 600,
                    }}
                  />
                </Card>
              ))
            : null}
        </>
      )}
    </>
  );
}

export default UserAddress;
