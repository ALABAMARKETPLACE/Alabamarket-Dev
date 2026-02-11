"use client";
import React, { useState } from "react";
import { Col, Row, Button, Card, DatePicker, Tooltip } from "antd";

import { LuUsers } from "react-icons/lu";
import { FiPackage, FiRefreshCw, FiCalendar, FiSun, FiMoon, FiCloud } from "react-icons/fi";
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: <FiSun /> };
  if (hour < 17) return { text: "Good Afternoon", icon: <FiCloud /> };
  return { text: "Good Evening", icon: <FiMoon /> };
};

function DashboardAdmin() {
  const [date, setDate] = useState<string | null>(null);
  const greeting = getGreeting();

  const { data: counts, isLoading, refetch: refetchCounts } = useQuery({
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
            disabledDate={(current) => current && current.isAfter(dayjs(), "day")}
            onChange={(date) => setDate(date ? date.format("YYYY-MM-DD") : null)}
            className="dashboard-welcome__date-picker"
          />
          <Tooltip title="Refresh data">
            <Button 
              type="primary" 
              ghost 
              icon={<FiRefreshCw className={isFetchingStats ? 'spin-animation' : ''} />}
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
                  <span className="dashboard-card-subtitle">Last 7 days performance</span>
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
                      ? `Orders - ${dayjs(date).format("MMM D, YYYY")}`
                      : "Today's Orders"}
                  </span>
                  <span className="dashboard-card-subtitle">Order breakdown by status</span>
                </div>
              }
              bordered={false}
              className="dashboard-chart-card"
            >
              {(orderStatistics?.totalOrders ?? 0) > 0 ? (
                <div className="dashboard-pie-chart-wrapper">
                  <PieChart data={orderStatistics?.orderStatistics} />
                </div>
              ) : (
                <div className="dashboard-empty-chart">
                  <FiPackage className="dashboard-empty-chart__icon" />
                  <p>No orders for this date</p>
                </div>
              )}

              {/* Order Statistics Table */}
              <div className="dashboard-stats-table">
                <div className="dashboard-stats-table__row dashboard-stats-table__row--header">
                  <span>Status</span>
                  <span>Count</span>
                </div>
                <div className="dashboard-stats-table__row dashboard-stats-table__row--total">
                  <span>Total Orders</span>
                  <span className="dashboard-stats-table__value">
                    {orderStatistics?.totalOrders || 0}
                  </span>
                </div>
                {typeof orderStatistics?.orderStatistics === "object" &&
                  Object.keys(orderStatistics?.orderStatistics || {})?.map(
                    (item, key) => (
                      <div key={key} className="dashboard-stats-table__row">
                        <span className="dashboard-stats-table__label">{item}</span>
                        <span className="dashboard-stats-table__value">
                          {orderStatistics?.orderStatistics[item]}
                        </span>
                      </div>
                    )
                  )}
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </main>
  );
}

export default DashboardAdmin;
