import React from "react";
import { Col, Row } from "react-bootstrap";
import Cards from "@/app/(dashboard)/_components/cards";
import { FaShop } from "react-icons/fa6";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { FaBalanceScaleLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import SkeletonLoading from "@/app/(dashboard)/_components/skeleton";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { GiMoneyStack } from "react-icons/gi";
import Error from "@/app/(dashboard)/_components/error";

function Summary() {
  const settings = useAppSelector(reduxSettings);
  const {
    data: settlement,
    isLoading,
    isError,
    error,
  } = useQuery<any>({
    queryKey: [API.SETTLEMENT_SUMMARY],
    select: (data) => {
      if (data?.status) return data?.data;
      return {};
    },
  });
  return (
    <section>
      {isLoading ? (
        <SkeletonLoading count={4} size="xsm" />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <Row>
          <Col md="3">
            <Cards
              Title={"Balance to Settle"}
              Desc={"Remaining amount to be settled"}
              value={`${settings?.currency} ${settlement?.amountToSettle ?? 0}`}
              icon={<GiMoneyStack color="orange" />}
            />
          </Col>

          <Col md="3">
            <Cards
              Title={"Settled Amount"}
              Desc={"Total amount settled till now."}
              value={`${settings?.currency} ${
                settlement?.totalSettledPrice ?? 0
              }`}
              icon={<IoCheckmarkDoneCircle color="green" />}
            />
          </Col>
          <Col md="3">
            <Cards
              Title={"Total Order Price"}
              Desc={"The sum of all orders in your store"}
              value={`${settings?.currency} ${
                settlement?.totalOrderPrice ?? 0
              }`}
              icon={<FaShop color="blue" />}
            />
          </Col>
          <Col md="3">
            <Cards
              Title={"Settlement Pending"}
              Desc={"Sum of pending settlements."}
              value={`${settings?.currency} ${
                settlement?.settlementPending ?? 0
              }`}
              icon={<FaBalanceScaleLeft color="grey" />}
            />
          </Col>
        </Row>
      )}
    </section>
  );
}

export default Summary;
