"use client";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import ChargeFormCard from "./components/chargeFormCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { notification, Button } from "antd";
import { POST } from "@/util/apicall";
import { useRouter } from "next/navigation";

function DeliveryCharge() {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: DeliveryCharge, isLoading: isProductLoading } = useQuery<any>({
    queryKey: [API.DELIVERY_CHARGE],
  });

  const { data: distanceCharge, isLoading: isDistanceLoading } = useQuery<any>({
    queryKey: [API.DISTANCE_CHARGE],
  });

  const mutationDeliveryCreate = useMutation({
    mutationFn: async (body: any) => {
      let obj = {
        deliveryChargeItems: [...body?.items],
      };
      return POST(API.DELIVERY_CHARGE_UPSERT, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Product Charge Updated Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [API.DELIVERY_CHARGE] });
    },
  });

  const mutationDistanceCreate = useMutation({
    mutationFn: async (body: any) => {
      let obj = {
        distanceChargeItems: [...body?.items],
      };
      return POST(API.DISTANCE_CHARGE_UPSERT, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Distance Charge Updated Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [API.DISTANCE_CHARGE] });
    },
  });

  return (
    <div>
      {contextHolder}
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Delivery Charges</div>
        <div className="dashboard-pageHeaderBox">
          <Button
            type="primary"
            onClick={() => router.push("/auth/settings/new-distance-charge")}
          >
            Manage New Distance Charges
          </Button>
        </div>
      </div>
      <Container>
        <Row>
          <Col md={6}>
            <ChargeFormCard
              cardTitle="Product Charges"
              initialData={DeliveryCharge?.data}
              isLoading={isProductLoading}
              btnLoading={mutationDeliveryCreate.isPending}
              onFinish={(val: any) => mutationDeliveryCreate.mutate(val)}
              firstFieldName={"amount"}
              secondFieldName={"comparisonOperator"}
              thirdFieldName={"charge"}
            />
          </Col>
          <Col md={6}>
            <ChargeFormCard
              cardTitle="Distance Charges"
              onFinish={(val: any) => {
                mutationDistanceCreate.mutate(val);
              }}
              isLoading={isDistanceLoading}
              initialData={distanceCharge?.data}
              firstFieldName={"distance"}
              secondFieldName={"operator"}
              thirdFieldName={"charge"}
              btnLoading={mutationDistanceCreate?.isPending}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DeliveryCharge;
