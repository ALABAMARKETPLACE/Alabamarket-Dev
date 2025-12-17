"use client";
import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { Button, Card, DatePicker } from "antd";

import { LuUsers2 } from "react-icons/lu";
import { FiPackage } from "react-icons/fi";
import { TbUsersGroup } from "react-icons/tb";
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

function DashboardAdmin() {
  const [date, setDate] = useState<any>(null);

  const { data: counts, isLoading } = useQuery({
    queryKey: [API.DASHBOARD_COUNTS],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });

  const {
    data: statistics,
    isLoading: isLoading2,
    refetch,
  } = useQuery({
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
  return (
    <main>
      <div style={{ margin: 5 }} />
      <div className="DashboardAdmin-Box">
        <div>
          <div className="DashboardAdmin-text1">Good Morning, Admin</div>
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
          <Button type="primary" ghost onClick={() => refetch()}>
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
              <Row>
                <Col sm={3}>
                  <Cards
                    Title={"Users"}
                    Desc={"All Users"}
                    value={counts?.userCount ?? 0}
                    icon={<LuUsers2 color="green" />}
                    link="/auth/users"
                  />
                </Col>
                <Col sm={3}>
                  <Cards
                    Title={"Orders"}
                    Desc={"All Orders"}
                    value={counts?.orderCount ?? 0}
                    icon={<FiPackage color="blue" />}
                    link="/auth/orders"
                  />
                </Col>
                <Col sm={3}>
                  <Cards
                    Title={"Sellers"}
                    Desc={"All Sellers"}
                    value={counts?.sellerCount ?? 0}
                    icon={<TbUsersGroup color="orange" />}
                    link="/auth/sellers"
                  />
                </Col>
                <Col sm={3}>
                  <Cards
                    Title={"Products"}
                    Desc={"Total Products"}
                    value={counts?.productsCount ?? 0}
                    icon={<HiOutlineRectangleGroup color="#63ccf2" />}
                    link="/auth/products"
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

export default DashboardAdmin;
