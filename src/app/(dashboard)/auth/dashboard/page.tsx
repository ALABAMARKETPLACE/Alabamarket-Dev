"use client";
import React, { useState } from "react";
import { Col, Row, Button, Card, DatePicker, Tooltip } from "antd";

import { LuUsers } from "react-icons/lu";
import {
  FiPackage,
  FiRefreshCw,
  FiCalendar,
  FiSun,
  FiMoon,
  FiCloud,
} from "react-icons/fi";
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

const STATUS_COLORS = [
  { key: "pending",          color: "#F59E0B", label: "Pending" },
  { key: "processing",       color: "#3B82F6", label: "Processing" },
  { key: "shipped",          color: "#8B5CF6", label: "Shipped" },
  { key: "out_for_delivery", color: "#06B6D4", label: "Out for Delivery" },
  { key: "delivered",        color: "#10B981", label: "Delivered" },
  { key: "cancelled",        color: "#EF4444", label: "Cancelled" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: <FiSun /> };
  if (hour < 17) return { text: "Good Afternoon", icon: <FiCloud /> };
  return { text: "Good Evening", icon: <FiMoon /> };
};

function DashboardAdmin() {
  const [date, setDate] = useState<string | null>(null);
  const greeting = getGreeting();

  const {
    data: counts,
    isLoading,
    refetch: refetchCounts,
  } = useQuery({
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
    isFetching: isFetchingStats,
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

  const handleRefresh = () => {
    refetchCounts();
    refetch();
  };

  return (
    <main className="dashboard-content-wrapper">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome__content">
          <div className="dashboard-welcome__greeting">
            <span className="dashboard-welcome__icon">{greeting.icon}</span>
            <h1 className="dashboard-welcome__title">{greeting.text}, Admin</h1>
          </div>
          <p className="dashboard-welcome__subtitle">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <DatePicker
            placeholder="Filter by date"
            suffixIcon={<FiCalendar />}
            disabledDate={(current) =>
              current && current.isAfter(dayjs(), "day")
            }
            onChange={(date) =>
              setDate(date ? date.format("YYYY-MM-DD") : null)
            }
            className="dashboard-welcome__date-picker"
          />
          <Tooltip title="Refresh data">
            <Button
              type="primary"
              ghost
              icon={
                <FiRefreshCw
                  className={isFetchingStats ? "spin-animation" : ""}
                />
              }
              onClick={handleRefresh}
              loading={isFetchingStats}
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats-section">
        {isLoading ? (
          <SkeletonLoading size="xsm" count={4} />
        ) : (
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} lg={6}>
              <Cards
                Title="Total Users"
                Desc="Registered users"
                value={counts?.userCount ?? 0}
                icon={<LuUsers />}
                link="/auth/users"
                color="primary"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Cards
                Title="Total Orders"
                Desc="All time orders"
                value={counts?.orderCount ?? 0}
                icon={<FiPackage />}
                link="/auth/orders"
                color="success"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Cards
                Title="Active Sellers"
                Desc="Verified sellers"
                value={counts?.sellerCount ?? 0}
                icon={<TbUsersGroup />}
                link="/auth/sellers"
                color="info"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Cards
                Title="Products"
                Desc="Listed products"
                value={counts?.productsCount ?? 0}
                icon={<HiOutlineRectangleGroup />}
                link="/auth/products"
                color="warning"
              />
            </Col>
          </Row>
        )}
      </div>

      {/* Charts Section */}
      <Row gutter={[20, 20]} className="dashboard-charts-section">
        <Col xs={24} xl={16}>
          {isLoading2 ? (
            <SkeletonLoading count={1} size="xlg" />
          ) : (
            <Card
              title={
                <div className="dashboard-card-title">
                  <span>Weekly Order Statistics</span>
                  <span className="dashboard-card-subtitle">
                    Last 7 days performance
                  </span>
                </div>
              }
              bordered={false}
              className="dashboard-chart-card"
            >
              <SalesChart data={statistics?.orderStatistics} />
            </Card>
          )}
        </Col>

        <Col xs={24} xl={8}>
          {isLoading3 ? (
            <SkeletonLoading count={1} size="xxlg" />
          ) : (
            <Card
              title={
                <div className="dashboard-card-title">
                  <span>
                    {date
                      ? `Orders — ${dayjs(date).format("MMM D, YYYY")}`
                      : "Today's Orders"}
                  </span>
                  <span className="dashboard-card-subtitle">
                    Breakdown by status
                  </span>
                </div>
              }
              bordered={false}
              className="dashboard-chart-card"
            >
              {(orderStatistics?.totalOrders ?? 0) > 0 ? (
                <>
                  <div className="dashboard-pie-chart-wrapper">
                    <PieChart data={orderStatistics?.orderStatistics} />
                  </div>

                  {/* Status breakdown rows */}
                  <div className="order-status-breakdown">
                    {STATUS_COLORS.map(({ key, color, label }) => {
                      const count =
                        orderStatistics?.orderStatistics?.[key] ?? 0;
                      if (count === 0) return null;
                      const pct = orderStatistics?.totalOrders
                        ? Math.round(
                            (count / orderStatistics.totalOrders) * 100,
                          )
                        : 0;
                      return (
                        <div key={key} className="order-status-row">
                          <div className="order-status-row__left">
                            <span
                              className="order-status-row__dot"
                              style={{ background: color }}
                            />
                            <span className="order-status-row__label">
                              {label}
                            </span>
                          </div>
                          <div className="order-status-row__right">
                            <div className="order-status-row__bar-wrap">
                              <div
                                className="order-status-row__bar"
                                style={{
                                  width: `${pct}%`,
                                  background: color,
                                }}
                              />
                            </div>
                            <span className="order-status-row__pct">
                              {pct}%
                            </span>
                            <span className="order-status-row__count">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Any statuses not in the predefined map */}
                    {typeof orderStatistics?.orderStatistics === "object" &&
                      Object.keys(orderStatistics.orderStatistics)
                        .filter(
                          (k) => !STATUS_COLORS.find((s) => s.key === k),
                        )
                        .map((key) => {
                          const count =
                            orderStatistics.orderStatistics[key] ?? 0;
                          const pct = orderStatistics.totalOrders
                            ? Math.round(
                                (count / orderStatistics.totalOrders) * 100,
                              )
                            : 0;
                          return (
                            <div key={key} className="order-status-row">
                              <div className="order-status-row__left">
                                <span
                                  className="order-status-row__dot"
                                  style={{ background: "#95A5A6" }}
                                />
                                <span className="order-status-row__label">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="order-status-row__right">
                                <div className="order-status-row__bar-wrap">
                                  <div
                                    className="order-status-row__bar"
                                    style={{
                                      width: `${pct}%`,
                                      background: "#95A5A6",
                                    }}
                                  />
                                </div>
                                <span className="order-status-row__pct">
                                  {pct}%
                                </span>
                                <span className="order-status-row__count">
                                  {count}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                    <div className="order-status-total">
                      <span>Total</span>
                      <span>{orderStatistics?.totalOrders ?? 0} orders</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="dashboard-empty-chart">
                  <FiPackage className="dashboard-empty-chart__icon" />
                  <p>No orders for this date</p>
                </div>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </main>
  );
}

export default DashboardAdmin;
