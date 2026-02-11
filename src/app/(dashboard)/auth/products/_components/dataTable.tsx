"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Table,
  Image,
  Pagination,
  Popconfirm,
  notification,
  Tooltip,
} from "antd";
import { FiEdit2, FiTrash2, FiPackage, FiCalendar, FiDollarSign, FiBox } from "react-icons/fi";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import Link from "next/link";
import API from "@/config/API";
import { DELETE } from "@/util/apicall";
import { formatCurrency } from "@/utils/formatNumber";

interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
  onDeleted?: () => void;
}
function DataTable({
  data,
  count,
  setPage,
  setTake,
  pageSize,
  page,
  onDeleted,
}: props) {
  const Settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusTag = (item: boolean) => {
    if (item === true) {
      return (
        <span className="dashboard-badge dashboard-badge--success">Active</span>
      );
    }
    if (item === false) {
      return (
        <span className="dashboard-badge dashboard-badge--warning">Inactive</span>
      );
    }
    return (
      <span className="dashboard-badge dashboard-badge--default">Unknown</span>
    );
  };

  const renderQuantity = (item: any) => (
    <span>
      {item == 0 ? (
        <span className="text-danger">Out of stock</span>
      ) : (
        <span>{item}</span>
      )}
    </span>
  );

  const handleDelete = async (
    id: string | number,
    storeId?: string | number,
  ) => {
    setDeleteLoadingId(id);
    try {
      const response: any = await DELETE(
        API.PRODUCT_DELETE + id,
        null,
        storeId ? { storeId } : undefined,
      );
      if (response?.status) {
        notification.success({ message: "Product deleted successfully" });
        onDeleted?.();
      } else {
        // Extract error message from nested structure
        let errorMessage = "Failed to delete product";
        if (response?.message) {
          if (
            typeof response.message === "object" &&
            response.message.message
          ) {
            errorMessage = response.message.message;
          } else if (typeof response.message === "string") {
            errorMessage = response.message;
          }
        }
        notification.error({
          message: errorMessage,
        });
      }
    } catch (error: any) {
      // Extract error message from nested structure
      let errorMessage = "Failed to delete product";
      if (error?.message) {
        if (typeof error.message === "object" && error.message.message) {
          errorMessage = error.message.message;
        } else if (typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      notification.error({
        message: errorMessage,
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 50,
      render: (item: string) => (
        <div className="table-img">
          <Image
            preview={false}
            style={{ height: 35, width: 35, objectFit: "cover" }}
            src={item}
          />
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Quantity",
      dataIndex: "unit",
      key: "unit",
      render: renderQuantity,
    },
    {
      title: "Price",
      dataIndex: "retail_rate",
      key: "price",
      render: (item: number) => (
        <span>
          {Settings.currency === "NGN" ? "₦" : (Settings.currency ?? "")}{" "}
          {formatCurrency(item)}
        </span>
      ),
      //   responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (item: boolean) => getStatusTag(item),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any, record: any) => {
        return <div>{moment(text).format("MMM Do YYYY")}</div>;
      },
    },
    {
      title: "Action",
      dataIndex: "_id",
      key: "_id",
      width: 120,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Tooltip title="Edit product">
            <Link href={`/auth/products/${id}`}>
              <Button type="text" size="small" icon={<FiEdit2 size={16} color="#1890ff" />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete product"
            description="Are you sure you want to delete this product?"
            okText="Delete"
            okType="danger"
            onConfirm={() => handleDelete(id, record?.storeId)}
          >
            <Tooltip title="Delete product">
              <Button 
                type="text" 
                size="small" 
                loading={deleteLoadingId === id}
                icon={<FiTrash2 size={16} color="#ff4d4f" />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const renderMobileCards = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiPackage size={48} />
          <p>No products yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const id = record?._id ?? record?.id;
      const createdAt = record?.createdAt
        ? moment(record?.createdAt).format("MMM Do YYYY")
        : "-";
      const price =
        typeof record?.retail_rate === "number"
          ? `${
              Settings.currency === "NGN" ? "₦" : (Settings.currency ?? "")
            } ${formatCurrency(record?.retail_rate)}`
          : "--";

      return (
        <div className="dashboard-mobile-card" key={id}>
          <div className="dashboard-mobile-card__header">
            <div className="dashboard-mobile-card__avatar">
              <Image
                preview={false}
                src={record?.image}
                alt={record?.name}
                height={56}
                width={56}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
              />
            </div>
            <div className="dashboard-mobile-card__info">
              <h4 className="dashboard-mobile-card__title">{record?.name ?? "Unnamed Product"}</h4>
              <span className="dashboard-mobile-card__subtitle">
                <FiCalendar size={12} /> {createdAt}
              </span>
            </div>
            {getStatusTag(record?.status)}
          </div>
          <div className="dashboard-mobile-card__body">
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiBox size={14} /> Quantity
              </span>
              <span className="dashboard-mobile-card__value">{renderQuantity(record?.unit)}</span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiDollarSign size={14} /> Price
              </span>
              <span className="dashboard-mobile-card__value dashboard-mobile-card__value--highlight">{price}</span>
            </div>
          </div>
          <div className="dashboard-mobile-card__actions">
            <Link href={`/auth/products/${id}`}>
              <Button type="primary" ghost icon={<FiEdit2 size={14} />} size="small">
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Delete product"
              description="Are you sure you want to delete this product?"
              okText="Delete"
              okType="danger"
              placement="topRight"
              onConfirm={() => handleDelete(id, record?.storeId)}
            >
              <Button
                danger
                size="small"
                loading={deleteLoadingId === id}
                icon={<FiTrash2 size={14} />}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    });
  }, [Settings?.currency, data, deleteLoadingId]);

  return (
    <div className="dashboard-table-container">
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record?._id ?? record?.id}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiPackage size={48} />
                <p>No products yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="dashboard-mobile-cards">{renderMobileCards}</div>
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={(total: any) => `Total ${count ?? 0} Products`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
        />
      </div>
    </div>
  );
}

export default DataTable;
