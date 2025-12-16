"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Table,
  Image,
  Tag,
  Pagination,
  Popconfirm,
  notification,
} from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { AiOutlineProduct } from "react-icons/ai";
import Link from "next/link";
import API from "@/config/API";
import { DELETE } from "@/util/apicall";
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
        <Tag color="success" bordered={false}>
          Active
        </Tag>
      );
    }
    if (item === false) {
      return (
        <Tag color="warning" bordered={false}>
          Inactive
        </Tag>
      );
    }
    return (
      <Tag color="default" bordered={false}>
        Unknown
      </Tag>
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

  const handleDelete = async (id: string | number) => {
    setDeleteLoadingId(id);
    try {
      const response: any = await DELETE(API.PRODUCT_DELETE + id);
      if (response?.status) {
        notification.success({ message: "Product deleted successfully" });
        onDeleted?.();
      } else {
        notification.error({
          message: response?.message ?? "Failed to delete product",
        });
      }
    } catch (error: any) {
      notification.error({
        message: error?.message ?? "Failed to delete product",
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
          {Number(item)?.toFixed(2)} {Settings?.currency ?? ""}
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
      width: 100,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Link href={`/auth/products/${id}`}>
            <Button type="text" size="small">
              <TbEdit size={22} color="orange" />
            </Button>
          </Link>
          <Popconfirm
            title="Delete product"
            description="Are you sure you want to delete this product?"
            okText="Delete"
            okType="danger"
            onConfirm={() => handleDelete(id)}
          >
            <Button type="text" size="small" loading={deleteLoadingId === id}>
              <MdDeleteOutline size={20} color="#ff4d4f" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const renderMobileCards = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="products-tableMobileEmpty">
          <AiOutlineProduct size={40} />
          <p>No Products yet</p>
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
          ? `${Number(record?.retail_rate).toFixed(2)} ${
              Settings?.currency ?? ""
            }`
          : "--";

      return (
        <div className="products-tableMobileCard" key={id}>
          <div className="products-tableMobileHeader">
            <div className="products-tableMobileImage">
              <Image
                preview={false}
                src={record?.image}
                alt={record?.name}
                height={50}
                width={50}
              />
            </div>
            <div className="products-tableMobileTitle">
              <div className="title">{record?.name ?? "Unnamed Product"}</div>
              <div className="sub">{createdAt}</div>
            </div>
            <div className="products-tableMobileStatus">
              {getStatusTag(record?.status)}
            </div>
          </div>
          <div className="products-tableMobileBody">
            <div className="products-tableMobileRow">
              <span className="label">Quantity</span>
              <span className="value">{renderQuantity(record?.unit)}</span>
            </div>
            <div className="products-tableMobileRow">
              <span className="label">Price</span>
              <span className="value">{price}</span>
            </div>
          </div>
          <div className="products-tableMobileActions">
            <Link href={`/auth/products/${id}`}>
              <Button type="primary" ghost icon={<TbEdit />} size="small">
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Delete product"
              description="Are you sure you want to delete this product?"
              okText="Delete"
              okType="danger"
              placement="topRight"
              onConfirm={() => handleDelete(id)}
            >
              <Button
                danger
                size="small"
                loading={deleteLoadingId === id}
                icon={<MdDeleteOutline size={16} />}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    });
  }, [Settings?.currency, data]);

  return (
    <>
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          className="products-tableDesktop"
          locale={{
            emptyText: (
              <div className="py-5">
                <AiOutlineProduct size={40} />
                <p>No Products yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="products-tableMobile">{renderMobileCards}</div>
      )}
      <div className="table-pagination">
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
    </>
  );
}

export default DataTable;
