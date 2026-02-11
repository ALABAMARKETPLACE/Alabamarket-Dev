"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Input,
  Button,
  Card,
  Steps,
  notification,
  Spin,
  Empty,
  Tag,
  Divider,
} from "antd";
import {
  FiPackage,
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiBox,
  FiAlertCircle,
} from "react-icons/fi";
import moment from "moment";
import API from "@/config/API";
import { formatCurrency } from "@/utils/formatNumber";
import { useSelector } from "react-redux";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useSearchParams, useRouter } from "next/navigation";
import "./style.scss";

const { Step } = Steps;

interface TrackingUpdate {
  status: string;
  timestamp: string;
  remark?: string;
}

interface TrackingData {
  reference: string;
  order_status: string;
  items_count: number;
  total_amount: number;
  delivery_address: string;
  estimated_delivery: string;
  tracking_updates: TrackingUpdate[];
  order_id?: string;
  payment_status?: string;
  delivery_charge?: number;
  created_at?: string;
}

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("placed") || statusLower.includes("confirmed")) {
    return <FiCheckCircle />;
  }
  if (statusLower.includes("processing") || statusLower.includes("preparing")) {
    return <FiBox />;
  }
  if (statusLower.includes("shipped") || statusLower.includes("transit")) {
    return <FiTruck />;
  }
  if (statusLower.includes("delivered")) {
    return <FiCheckCircle />;
  }
  if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
    return <FiAlertCircle />;
  }
  return <FiPackage />;
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("delivered")) return "success";
  if (statusLower.includes("cancelled") || statusLower.includes("failed"))
    return "error";
  if (statusLower.includes("shipped") || statusLower.includes("transit"))
    return "processing";
  return "default";
};

function TrackOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reference, setReference] = useState(searchParams.get("ref") || "");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [searched, setSearched] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const settings = useSelector(reduxSettings);

  const currencySymbol =
    settings?.currency === "NGN" ? "₦" : settings?.currency;

  const handleTrackOrder = async (ref?: string) => {
    const searchRef = ref || reference.trim();

    if (!searchRef) {
      Notifications.warning({
        message: "Reference Required",
        description: "Please enter your order reference number to track.",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${API.BASE_URL}${API.ORDER_TRACK_GUEST}${encodeURIComponent(searchRef)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data?.status && data?.data) {
        setTrackingData(data.data);
        // Update URL with reference for sharing
        router.replace(`/track-order?ref=${encodeURIComponent(searchRef)}`, {
          scroll: false,
        });
      } else {
        setTrackingData(null);
        Notifications.error({
          message: "Order Not Found",
          description:
            data?.message ||
            "We couldn't find an order with that reference. Please check and try again.",
        });
      }
    } catch (error) {
      console.error("Track order error:", error);
      setTrackingData(null);
      Notifications.error({
        message: "Something went wrong",
        description:
          "Unable to track your order at the moment. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if reference is in URL
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setReference(refFromUrl);
      handleTrackOrder(refFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrackOrder();
    }
  };

  const getCurrentStep = () => {
    if (!trackingData?.tracking_updates?.length) return 0;
    return trackingData.tracking_updates.length - 1;
  };

  return (
    <div className="track-order-page">
      {contextHolder}

      {/* Hero Section */}
      <div className="track-order-hero">
        <div className="track-order-hero__content">
          <div className="track-order-hero__icon">
            <FiPackage size={40} />
          </div>
          <h1 className="track-order-hero__title">Track Your Order</h1>
          <p className="track-order-hero__subtitle">
            Enter your order reference number to see the current status and
            delivery updates
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="track-order-search">
        <Card className="track-order-search__card">
          <div className="track-order-search__input-group">
            <Input
              size="large"
              placeholder="Enter your order reference (e.g., ORDER_1707580800000_ABC123)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onKeyPress={handleKeyPress}
              prefix={<FiSearch className="track-order-search__icon" />}
              className="track-order-search__input"
              allowClear
            />
            <Button
              type="primary"
              size="large"
              onClick={() => handleTrackOrder()}
              loading={loading}
              className="track-order-search__button"
            >
              Track Order
            </Button>
          </div>
          <p className="track-order-search__hint">
            You can find your order reference in the confirmation email or SMS
            sent after your purchase
          </p>
        </Card>
      </div>

      {/* Results Section */}
      <div className="track-order-results">
        {loading ? (
          <div className="track-order-loading">
            <Spin size="large" />
            <p>Searching for your order...</p>
          </div>
        ) : trackingData ? (
          <div className="track-order-details">
            {/* Order Summary Card */}
            <Card className="track-order-summary">
              <div className="track-order-summary__header">
                <div className="track-order-summary__title">
                  <FiPackage size={24} />
                  <div>
                    <h2>Order Summary</h2>
                    <p className="track-order-summary__reference">
                      Reference: {trackingData.reference}
                    </p>
                  </div>
                </div>
                <Tag
                  color={getStatusColor(trackingData.order_status)}
                  className="track-order-summary__status"
                >
                  {trackingData.order_status}
                </Tag>
              </div>

              <Divider />

              <div className="track-order-summary__grid">
                <div className="track-order-summary__item">
                  <FiBox className="track-order-summary__item-icon" />
                  <div>
                    <span className="track-order-summary__label">Items</span>
                    <span className="track-order-summary__value">
                      {trackingData.items_count} item
                      {trackingData.items_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="track-order-summary__item">
                  <FiClock className="track-order-summary__item-icon" />
                  <div>
                    <span className="track-order-summary__label">
                      Total Amount
                    </span>
                    <span className="track-order-summary__value">
                      {currencySymbol}{" "}
                      {formatCurrency(trackingData.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="track-order-summary__item">
                  <FiMapPin className="track-order-summary__item-icon" />
                  <div>
                    <span className="track-order-summary__label">
                      Delivery Address
                    </span>
                    <span className="track-order-summary__value">
                      {trackingData.delivery_address}
                    </span>
                  </div>
                </div>

                {trackingData.estimated_delivery && (
                  <div className="track-order-summary__item">
                    <FiCalendar className="track-order-summary__item-icon" />
                    <div>
                      <span className="track-order-summary__label">
                        Estimated Delivery
                      </span>
                      <span className="track-order-summary__value">
                        {moment(trackingData.estimated_delivery).format(
                          "MMMM Do, YYYY",
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tracking Timeline Card */}
            <Card className="track-order-timeline">
              <h3 className="track-order-timeline__title">
                <FiTruck size={20} />
                Tracking Updates
              </h3>

              {trackingData.tracking_updates?.length > 0 ? (
                <Steps
                  direction="vertical"
                  current={getCurrentStep()}
                  className="track-order-timeline__steps"
                >
                  {trackingData.tracking_updates.map((update, index) => (
                    <Step
                      key={index}
                      title={
                        <span className="track-order-timeline__step-title">
                          {update.status}
                        </span>
                      }
                      description={
                        <div className="track-order-timeline__step-desc">
                          <span className="track-order-timeline__step-time">
                            {moment(update.timestamp).format(
                              "MMM DD, YYYY • h:mm A",
                            )}
                          </span>
                          {update.remark && (
                            <span className="track-order-timeline__step-remark">
                              {update.remark}
                            </span>
                          )}
                        </div>
                      }
                      icon={getStatusIcon(update.status)}
                    />
                  ))}
                </Steps>
              ) : (
                <Empty
                  description="No tracking updates available yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>

            {/* Help Section */}
            <Card className="track-order-help">
              <h3>Need Help?</h3>
              <p>
                If you have questions about your order, please contact our
                support team with your order reference number.
              </p>
              <Button type="link" href="/contact_us">
                Contact Support
              </Button>
            </Card>
          </div>
        ) : searched ? (
          <div className="track-order-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <h3>No Order Found</h3>
                  <p>
                    We couldn&apos;t find an order with that reference number.
                    Please check and try again.
                  </p>
                </div>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
function TrackOrderPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="track-order-page">
          <div className="track-order-hero">
            <div className="track-order-hero__content">
              <div className="track-order-hero__icon">
                <FiPackage size={40} />
              </div>
              <h1 className="track-order-hero__title">Track Your Order</h1>
              <p className="track-order-hero__subtitle">Loading...</p>
            </div>
          </div>
          <div className="track-order-loading" style={{ marginTop: 40 }}>
            <Spin size="large" />
          </div>
        </div>
      }
    >
      <TrackOrderPage />
    </Suspense>
  );
}

export default TrackOrderPageWrapper;
