"use client";
import React, { useState } from "react";
import "react-quill/dist/quill.snow.css";
import PageHeader from "../../../_components/pageHeader";
import DetailsForm from "./_components/detailsForm";
import ImageUpdate from "./_components/images";
import UpdateVariants from "./_components/variants";
import UpdateReview from "./_components/review";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import API from "@/config/API";
import { Button, notification, Popconfirm, Steps } from "antd";


function Page() {
  const [current, setCurrent] = useState(0);
  const [Notifications, contextHolder] = notification.useNotification();
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const mutationDelete = useMutation({
    mutationFn: (id: number | string) => {
      return DELETE(API.PRODUCT_DELETE + params?.id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Product Deleted Successfully`,
      });
      router.replace("/auth/products");
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
    },
  });
  return (
    <>
    
      <PageHeader
        title={"Update Product"}
        bredcume={"Dashboard / Products / Update"}
      ><Popconfirm
      title="Delete the Product"
      description="Are you sure to delete this Product? This operation cannot be undone!"
      okText="Yes"
      cancelText="No"
      placement="bottomLeft"
      okButtonProps={{ loading: mutationDelete.isPending }}
      onConfirm={() => mutationDelete.mutate(params?.id as string)}
    >
      <Button type="primary" danger>
        Delete Product
      </Button>
    </Popconfirm></PageHeader>
      <Steps
        current={current}
        onChange={(v) => setCurrent(v)}
        size="small"
        items={[
          {
            title: "Details",
            description: "Update Details",
          },
          {
            title: "Images",
            description: "Update Images",
          },
          {
            title: "Variants",
            description: "Update Variants",
          },
          {
            title: "Review",
            description: "Review & Finish",
          },
        ]}
      />
      <br />
      {current === 0 ? (
        <DetailsForm onContinue={() => setCurrent(1)} />
      ) : current === 1 ? (
        <ImageUpdate
          onBack={() => setCurrent(0)}
          onContinue={() => setCurrent(2)}
        />
      ) : current === 2 ? (
        <UpdateVariants
          back={() => setCurrent(1)}
          onContinue={() => setCurrent(3)}
        />
      ) : current === 3 ? (
        <UpdateReview onBack={() => setCurrent(2)} />
      ) : null}
    </>
  );
}

export default Page;
