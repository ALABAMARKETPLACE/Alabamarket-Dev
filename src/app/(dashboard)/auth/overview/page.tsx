"use client";
import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { Button, Card, DatePicker } from "antd";

import { FiPackage } from "react-icons/fi";
import { HiOutlineRectangleGroup } from "react-icons/hi2";

import Cards from "@/app/(dashboard)/_components/cards";
import SalesChart from "../../_components/charts/salesChart";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import SkeletonLoading from "@/app/(dashboard)/_components/skeleton";
import PieChart from "../../_components/charts/chart";
import Link from "next/link";
import dayjs from "dayjs";
import Error from "@/app/(dashboard)/_components/error";
import { GET } from "@/util/apicall";
import { FcBearish, FcBullish } from "react-icons/fc";
import { useSession } from "next-auth/react";
function DashboardSeller() {
  const { data: session, status }: any = useSession();
  const id = session?.user?.store_id;
  const [date, setDate] = useState<any>(null);
  const { data: counts, isLoading } = useQuery({
    queryFn: ({ queryKey }) => GET(API.COORPORATE_SELLER_DASHBOARD_COUNT + id),
    queryKey: ["corporate_seller_dashboard", id],
    select: (data: any) => {
      if (data?.status) return data;
      return {};
    },
  });
  const { data: statistics, isLoading: isLoading2 } = useQuery({
    queryKey: [API.DASHBOARD_STATISTICS],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });
  const { data: orderStatistics, isLoading: isLoading3 } = useQuery({
    queryKey: [API.DASHBOARD_ORDER_STATISTICS, { ...(date && { date }) }],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });
  let PendingAmount = counts?.orderTotal - counts?.settled_amount;
  return (
    <main>
      <div className="DashboardAdmin-Box">
        <div>
          <div className="DashboardAdmin-text1">Good Morning, Seller</div>
          <div className="DashboardAdmin-text2">
            Welcome to Sales Analysis and Manage Dashboard
          </div>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div style={{ margin: 15 }} />
          <DatePicker
            className="align-self-center"
            disabledDate={(current) => {
              return current && current.isAfter(dayjs(), "day");
            }}
            onChange={(date) => setDate(date.format("YYYY-MM-DD"))}
          />
          <Button type="primary" ghost>
            Refresh
          </Button>
        </div>
      </div>
      <br />
      <div>
        <Row>
          <Col sm={8}>
            {isLoading ? (
              <SkeletonLoading size="xsm" count={4} />
            ) : (
              <Row className="same-height">
                <Col sm={3} className="col">
                  <Cards
                    Title={"Orders"}
                    Desc={"All Orders"}
                    value={counts?.totalOrders ?? 0}
                    icon={<FiPackage color="blue" />}
                    link="/auth/orders"
                  />
                </Col>
                <Col sm={3} className="col">
                  <Cards
                    Title={"Products"}
                    Desc={"Total Products"}
                    value={counts?.totalProducts ?? 0}
                    icon={<HiOutlineRectangleGroup color="#63ccf2" />}
                    link="/auth/products"
                  />
                </Col>
                <Col sm={3} className="col">
                  <Cards
                    Title={"Pending Amount"}
                    Desc={"Pending Amount"}
                    value={(PendingAmount ?? 0).toFixed(2) ?? 0}
                    icon={<FcBearish size={32} color="#63ccf2" />}
                    link="/auth/settlements"
                  />
                </Col>
                <Col sm={3} className="col">
                  <Cards
                    Title={"Total Amount"}
                    Desc={"Total Amount"}
                    value={counts?.orderTotal ?? 0}
                    icon={<FcBullish color="#63ccf2" size={32} />}
                    link="/auth/settlements"
                  />
                </Col>
              </Row>
            )}
            <br />
            {isLoading2 ? (
              <SkeletonLoading count={1} size="xlg" />
            ) : (
              <Card
                title={
                  <div className="d-flex justify-content-between">
                    Weekly Order Statistics{" "}
                    <Link href={"/auth/reports?report=order"}>
                      {/* <small>View more</small> */}
                    </Link>
                  </div>
                }
              >
                <SalesChart data={statistics?.orderStatistics} />
              </Card>
            )}
          </Col>
          <Col sm={4}>
            {isLoading3 ? (
              <SkeletonLoading count={1} size="xxlg" />
            ) : (
              <Card
                title={
                  date
                    ? "Order Statistics for " +
                      dayjs(date).format("dddd, MMMM YYYY")
                    : "Today's Orders Statistics"
                }
              >
                {orderStatistics?.totalOrders > 0 ? (
                  <PieChart data={orderStatistics?.orderStatistics} />
                ) : null}

                <Table bordered size="small" className="mt-3">
                  <tbody>
                    <tr key={474747}>
                      <td>
                        <div className="DashboardAdmin-card-text1">
                          Total Orders
                        </div>
                      </td>
                      <td>
                        <div className="DashboardAdmin-card-text2">
                          {orderStatistics?.totalOrders}
                        </div>
                      </td>
                    </tr>
                    {typeof orderStatistics?.orderStatistics == "object"
                      ? Object.keys(orderStatistics?.orderStatistics)?.map(
                          (item, key) => (
                            <tr key={key}>
                              <td>
                                <div className="DashboardAdmin-card-text1">
                                  {item}
                                </div>
                              </td>
                              <td>
                                <div className="DashboardAdmin-card-text2">
                                  {orderStatistics?.orderStatistics[item]}
                                </div>
                              </td>
                            </tr>
                          )
                        )
                      : null}
                  </tbody>
                </Table>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </main>
  );
}

export default DashboardSeller;
