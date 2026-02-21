"use client";
import { Pagination, Select } from "antd";
import React, { useCallback, useState, Suspense } from "react";
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaChevronRight,
  FaShoppingBag,
  FaExclamationCircle,
} from "react-icons/fa";
import Search from "antd/es/input/Search";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import moment from "moment";
import API from "@/config/API";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import { formatCurrency } from "@/utils/formatNumber";
import Image from "next/image";
import { getActiveDeliveryPromo } from "@/config/promoConfig";
import "./orders.scss";
import { useSession } from "next-auth/react";

const statusFilters = [
  { title: "All Orders", value: "" },
  { title: "Delivered", value: "delivered" },
  { title: "Pending", value: "pending" },
  { title: "Cancelled", value: "cancelled" },
];

const dateOptions = [
  { value: "", label: "All Time" },
  { value: "30days", label: "Last 30 days" },
  { value: "3months", label: "Past 3 months" },
  { value: "6months", label: "Past 6 months" },
  { value: "2023", label: "2023" },
];

const getVariantInfo = (data: any) => {
  let variants = "";
  if (Array.isArray(data?.combination)) {
    data.combination.forEach((item: any) => {
      variants += `${item.value} `;
    });
  }
  return variants.trim();
};

const getStatusClass = (status: string) => {
  const statusLower = status?.toLowerCase();
  if (statusLower === "delivered") return "order-card__status--delivered";
  if (statusLower === "cancelled") return "order-card__status--cancelled";
  if (statusLower === "pending") return "order-card__status--pending";
  if (
    ["processing", "shipped", "out_for_delivery", "out for delivery"].includes(
      statusLower,
    )
  ) {
    return "order-card__status--processing";
  }
  return "order-card__status--pending";
};

function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoadingSkeleton count={3} />}>
      <UserOrders />
    </Suspense>
  );
}

// Loading Skeleton Component
const OrdersLoadingSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="orders-loading">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="orders-loading__card">
        <div className="orders-loading__header" />
        <div className="orders-loading__item">
          <div className="orders-loading__item-image" />
          <div className="orders-loading__item-content">
            <div className="orders-loading__item-content-line" />
            <div className="orders-loading__item-content-line" />
            <div className="orders-loading__item-content-line" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Order Item Component
const OrderItem = ({ item, currency }: { item: any; currency: string }) => {
  const variantInfo = getVariantInfo(item?.variantDetails);

  return (
    <div className="order-item">
      <div className="order-item__image">
        {item?.image ? (
          <Image
            src={item.image}
            alt={item?.name || "Product"}
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f5f5f5",
            }}
          >
            <FaBoxOpen size={24} color="#ccc" />
          </div>
        )}
      </div>
      <div className="order-item__details">
        <div className="order-item__name">
          {item?.name}
          {variantInfo && <span> - {variantInfo}</span>}
        </div>
        {variantInfo && (
          <div className="order-item__variant">Variant: {variantInfo}</div>
        )}
        <div className="order-item__meta">
          <span className="order-item__quantity">
            Qty: {item?.quantity || 1}
          </span>
          <span className="order-item__price">
            {currency === "NGN" ? "₦" : currency}{" "}
            {formatCurrency(item?.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({
  order,
  currency,
  onClick,
}: {
  order: any;
  currency: string;
  onClick: () => void;
}) => {
  const itemCount = order?.orderItems?.length || 0;
  const displayItems = order?.orderItems?.slice(0, 3) || [];
  const remainingItems = itemCount - 3;

  return (
    <div className="order-card" onClick={onClick}>
      <div className="order-card__header">
        <div className="order-card__header-left">
          <span className="order-card__order-id">
            Order <span>#{order?.order_id}</span>
          </span>
          <span className="order-card__date">
            <FaCalendarAlt size={12} />
            {moment(order?.createdAt).format("MMM DD, YYYY")}
          </span>
          <span className="items-badge">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="order-card__header-right">
          <span
            className={`order-card__status ${getStatusClass(order?.status)}`}
          >
            {order?.status}
          </span>
          <span className="order-card__total">
            {currency === "NGN" ? "₦" : currency}{" "}
            {formatCurrency(
              getActiveDeliveryPromo()
                ? (order?.grandTotal || 0) - (order?.deliveryCharge || 0)
                : order?.grandTotal,
            )}
          </span>
        </div>
      </div>

      <div className="order-card__body">
        <div className="order-card__items">
          {displayItems.map((item: any, index: number) => (
            <OrderItem key={index} item={item} currency={currency} />
          ))}
        </div>
      </div>

      <div className="order-card__footer">
        <span className="order-card__footer-info">
          {remainingItems > 0
            ? `+${remainingItems} more item${remainingItems > 1 ? "s" : ""}`
            : `Ordered ${moment(order?.createdAt).fromNow()}`}
        </span>
        <span className="order-card__footer-action">
          View Details <FaChevronRight size={12} />
        </span>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onShopNow }: { onShopNow: () => void }) => (
  <div className="orders-empty">
    <div className="orders-empty__icon">
      <FaShoppingBag />
    </div>
    <h3 className="orders-empty__title">No Orders Yet</h3>
    <p className="orders-empty__text">
      You haven&apos;t placed any orders yet.
      <br />
      Start shopping at Alaba Marketplace to see your orders here.
    </p>
    <button className="orders-empty__button" onClick={onShopNow}>
      Start Shopping Now
    </button>
  </div>
);

// Error State Component
const ErrorState = ({ message }: { message?: string }) => (
  <div className="orders-error">
    <div className="orders-error__icon">
      <FaExclamationCircle />
    </div>
    <h3 className="orders-error__title">Failed to Load Orders</h3>
    <p className="orders-error__text">
      {message || "Something went wrong. Please try again later."}
    </p>
  </div>
);

function UserOrders() {
  const searchParams = useSearchParams();
  const currpage = searchParams.get("page") || 1;
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(
    isNaN(Number(currpage)) ? 1 : Number(currpage),
  );
  const pageSize = 5;
  const router = useRouter();
  const Settings = useAppSelector(reduxSettings);
  const [orderStatus, setOrderStatus] = useState("");
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id || null;

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: async () => {
      const params = {
        order: "DESC",
        page: page,
        take: pageSize,
        ...(search && { name: search }),
        ...(orderStatus && { status: orderStatus }),
        ...(dateFilter && { sort: dateFilter }),
      };
      console.log("Fetching user orders endpoint:", API.ORDER_GET, params);
      return await GET(API.ORDER_GET, params, null, { token: (session as any)?.token });
    },
    queryKey: ["order_items", userId, page, search, orderStatus, dateFilter],
    enabled: Boolean(userId) && status === "authenticated" && !!(session as any)?.token,
    retry: 1,
  });

  const handleStatusChange = (value: string) => {
    if (!isLoading) {
      setOrderStatus(value);
      setPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToOrder = (orderId: string) => {
    router.push(`/user/orders/${orderId}`);
  };

  const currency = Settings.currency || "NGN";
  // Accept both { data: [...] } and [...]
  const rawList: any[] = Array.isArray(orders?.data)
    ? (orders?.data as any[])
    : Array.isArray(orders)
      ? (orders as unknown as any[])
      : [];

  // Map API response to normalized order objects (robust for /order/getall)
  const normalized = rawList.map((o) => {
    return {
      id: o?.id ?? o?.order_id ?? o?.orderId ?? o?._id ?? "",
      userId: o?.userId ?? "",
      addressId: o?.addressId ?? "",
      storeId: o?.storeId ?? "",
      totalItems:
        o?.totalItems ??
        (Array.isArray(o?.orderItems) ? o.orderItems.length : 0),
      paymentType: o?.paymentType ?? "",
      coupan: o?.coupan ?? "",
      tax: o?.tax ?? 0,
      deliveryCharge: o?.deliveryCharge ?? 0,
      discount: o?.discount ?? 0,
      total: o?.total ?? 0,
      grandTotal: o?.grandTotal ?? 0,
      status: o?.status ?? "",
      order_id: o?.order_id ?? o?.id ?? "",
      createdAt: o?.createdAt ?? o?.created_at ?? "",
      orderItems: o?.orderItems ?? [],
    };
  });
  const totalOrders = orders?.meta?.itemCount ?? normalized.length ?? 0;
  const hasOrders = normalized.length > 0;

  return (
    <div className="orders-page">
      {/* Page Header */}
      <div className="orders-header">
        <div className="orders-header__title">
          <div className="orders-header__icon">
            <FaBoxOpen size={24} />
          </div>
          <h1>My Orders</h1>
          {totalOrders > 0 && (
            <span className="orders-count">{totalOrders}</span>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="orders-filters">
        <div className="orders-filters__row">
          <div className="orders-filters__status-tags">
            {statusFilters.map((filter) => (
              <span
                key={filter.value}
                className={`status-tag ${
                  orderStatus === filter.value ? "status-tag--active" : ""
                } ${filter.value ? `status-tag--${filter.value}` : ""}`}
                onClick={() => handleStatusChange(filter.value)}
              >
                {filter.title}
              </span>
            ))}
          </div>

          <div className="orders-filters__controls">
            <Select
              value={dateFilter || undefined}
              placeholder="Filter by date"
              style={{ minWidth: 150 }}
              options={dateOptions}
              onChange={(v) => setDateFilter(v)}
              allowClear
            />
            <Search
              placeholder="Search orders..."
              allowClear
              enterButton="Search"
              size="middle"
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrdersLoadingSkeleton count={3} />
      ) : isError ? (
        <ErrorState message={(error as any)?.message} />
      ) : hasOrders ? (
        <>
          <div className="orders-list">
            {normalized.map((order: any) => (
              <OrderCard
                key={order.order_id || order._id}
                order={order}
                currency={currency}
                onClick={() => navigateToOrder(order.order_id)}
              />
            ))}
          </div>

          <div className="orders-pagination">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalOrders}
              responsive
              showSizeChanger={false}
              hideOnSinglePage
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <EmptyState onShopNow={() => router.push("/")} />
      )}
    </div>
  );
}

export default OrdersPage;
