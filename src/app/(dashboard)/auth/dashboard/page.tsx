"use client";
import React, { useState } from "react";
import { Col, Row, Button, Card, DatePicker } from "antd";

import { LuUsers } from "react-icons/lu";
import { FiPackage } from "react-icons/fi";
import { TbUsersGroup } from "react-icons/tb";
import { HiOutlineRectangleGroup } from "react-icons/hi2";

import Cards from "@/app/(dashboard)/_components/cards";
import SalesChart from "../../_components/charts/salesChart";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import SkeletonLoading from "@/app/(dashboard)/_components/skeleton";
import PieChart from "../../_components/charts/chart";
import dayjs from "dayjs";

interface DashboardCounts {
  userCount: number;
  orderCount: number;
  sellerCount: number;
  productsCount: number;
}

interface OrderStatisticItem {
  orderDate: string;
  orderCount: number;
}

interface DashboardStatistics {
  orderStatistics: OrderStatisticItem[];
}

interface DashboardOrderStatistics {
  totalOrders: number;
  orderStatistics: Record<string, number>;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

function DashboardAdmin() {
  const [date, setDate] = useState<string | null>(null);

  const { data: counts, isLoading } = useQuery({
    queryKey: [API.DASHBOARD_COUNTS],
    select: (data: ApiResponse<DashboardCounts>) => {
      if (data?.status) return data?.data;
      return {} as DashboardCounts;
    },
  });

  const {
    data: statistics,
    isLoading: isLoading2,
    refetch,
  } = useQuery({
    queryKey: [API.DASHBOARD_STATISTICS],
    select: (data: ApiResponse<DashboardStatistics>) => {
      if (data?.status) return data?.data;
      return {} as DashboardStatistics;
    },
  });

  const { data: orderStatistics, isLoading: isLoading3 } = useQuery({
    queryKey: [API.DASHBOARD_ORDER_STATISTICS, { ...(date && { date }) }],
    select: (data: ApiResponse<DashboardOrderStatistics>) => {
      if (data?.status) return data?.data;
      return {} as DashboardOrderStatistics;
    },
  });

  return (
    <main className="dashboard-content-wrapper">
      <div className="DashboardAdmin-Box">
        <div>
          <h1 className="DashboardAdmin-text1">Good Morning, Admin</h1>
          <p className="DashboardAdmin-text2">
            Welcome to Sales Analysis and Manage Dashboard
          </p>
        </div>
        <div>
          <DatePicker
            disabledDate={(current) => {
              return current && current.isAfter(dayjs(), "day");
            }}
            onChange={(date) =>
              setDate(date ? date.format("YYYY-MM-DD") : null)
            }
            style={{ marginRight: 12 }}
          />
          <Button type="primary" ghost onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {isLoading ? (
            <SkeletonLoading size="xsm" count={4} />
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} xl={6}>
                <Cards
                  Title={"Users"}
                  Desc={"All Users"}
                  value={counts?.userCount ?? 0}
                  icon={<LuUsers />}
                  link="/auth/users"
                />
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Cards
                  Title={"Orders"}
                  Desc={"All Orders"}
                  value={counts?.orderCount ?? 0}
                  icon={<FiPackage />}
                  link="/auth/orders"
                />
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Cards
                  Title={"Sellers"}
                  Desc={"All Sellers"}
                  value={counts?.sellerCount ?? 0}
                  icon={<TbUsersGroup />}
                  link="/auth/sellers"
                />
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Cards
                  Title={"Products"}
                  Desc={"Total Products"}
                  value={counts?.productsCount ?? 0}
                  icon={<HiOutlineRectangleGroup />}
                  link="/auth/products"
                />
              </Col>
            </Row>
          )}

          <div style={{ marginTop: 24 }}>
            {isLoading2 ? (
              <SkeletonLoading count={1} size="xlg" />
            ) : (
              <Card
                title={
                  <div className="d-flex justify-content-between">
                    Weekly Order Statistics
                  </div>
                }
                bordered={false}
                className="dashboard-card-base"
              >
                <SalesChart data={statistics?.orderStatistics} />
              </Card>
            )}
          </div>
        </Col>

        <Col xs={24} lg={8}>
          {isLoading3 ? (
            <SkeletonLoading count={1} size="xxlg" />
          ) : (
            <Card
              title={
                date
                  ? "Order Statistics for " + dayjs(date).format("MMM D, YYYY")
                  : "Today's Orders Statistics"
              }
              bordered={false}
              className="dashboard-card-base"
            >
              {(orderStatistics?.totalOrders ?? 0) > 0 ? (
                <div style={{ marginBottom: 24 }}>
                  <PieChart data={orderStatistics?.orderStatistics} />
                </div>
              ) : (
                <div
                  style={{
                    padding: "40px 0",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  No orders found
                </div>
              )}

              <div className="ant-table-wrapper">
                <div className="ant-table ant-table-small ant-table-bordered">
                  <div className="ant-table-container">
                    <div className="ant-table-content">
                      <table style={{ tableLayout: "auto", width: "100%" }}>
                        <tbody className="ant-table-tbody">
                          <tr className="ant-table-row">
                            <td className="ant-table-cell">
                              <span
                                className="DashboardAdmin-card-text1"
                                style={{ fontSize: 14 }}
                              >
                                Total Orders
                              </span>
                            </td>
                            <td
                              className="ant-table-cell"
                              style={{ textAlign: "right" }}
                            >
                              <span
                                className="DashboardAdmin-card-text2"
                                style={{ fontSize: 16 }}
                              >
                                {orderStatistics?.totalOrders || 0}
                              </span>
                            </td>
                          </tr>
                          {typeof orderStatistics?.orderStatistics ===
                            "object" &&
                            Object.keys(
                              orderStatistics?.orderStatistics || {},
                            )?.map((item, key) => (
                              <tr key={key} className="ant-table-row">
                                <td className="ant-table-cell">
                                  <span
                                    className="DashboardAdmin-card-text1"
                                    style={{ fontSize: 14 }}
                                  >
                                    {item}
                                  </span>
                                </td>
                                <td
                                  className="ant-table-cell"
                                  style={{ textAlign: "right" }}
                                >
                                  <span
                                    className="DashboardAdmin-card-text2"
                                    style={{ fontSize: 16 }}
                                  >
                                    {orderStatistics?.orderStatistics[item]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </main>
  );
}

export default DashboardAdmin;
