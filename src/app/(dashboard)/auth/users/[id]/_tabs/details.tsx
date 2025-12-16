import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Descriptions } from "antd";
import React, { useMemo } from "react";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import moment from "moment";

function UserDetails() {
  const params = useParams();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ signal }) => GET(API.USER_DETAILS + params?.id, {}, signal),
    queryKey: ["admin_user_details", params?.id],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });

  const userdata = useMemo<any[]>(() => {
    if (typeof user == "object") {
      const array = Object.keys(user)
        .filter((key) =>
          ["name", "email", "role", "phone", "username"].includes(key)
        )
        ?.map((item, index) => ({
          key: index,
          label: item,
          children: user[item],
        }));
      return [
        {
          key: "image",
          label: "Profile Image",
          children: <Avatar size={64} src={user?.image} />,
        },
        ...array,
        {
          key: "status",
          label: "Status",
          children: user?.status? "Active" : "Inactive",
        },
        {
          key: "joined",
          label: "Joined On",
          children: moment(user?.createdAt).format("MM/DD/YYYY"),
        },
        {
          key: "mail",
          label: "Mail Verify",
          children: user?.mail_verify ? (
            <span className="text-success">Verifed</span>
          ) : (
            <span className="text-danger">Not Verified</span>
          ),
        },
        {
          key: "mail",
          label: "Phone Verify",
          children: user?.phone_verify ? (
            <span className="text-success">Verifed</span>
          ) : (
            <span className="text-danger">Not Verified</span>
          ),
        },
      ];
    }
    return [];
  }, [user]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <Card>
          <Descriptions
            layout="horizontal"
            size="middle"
            items={userdata}
            labelStyle={{
              color: "black",
              textTransform: "capitalize",
              fontWeight: 600,
            }}
          />
        </Card>
      )}
    </>
  );
}

export default UserDetails;
