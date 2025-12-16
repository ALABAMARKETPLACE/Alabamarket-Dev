"use client";
import React, { useEffect, useReducer, useState } from "react";
import {
  Button,
  Table,
  Image,
  Tag,
  Popconfirm,
  Popover,
  Form,
  Input,
  Space,
  Pagination,
  Badge,
  notification,
} from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import { CgReorder } from "react-icons/cg";
import moment from "moment";
import { TfiLayoutSliderAlt } from "react-icons/tfi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE, PUT } from "@/util/apicall";
import { reducer } from "./reducer";
import API from "@/config/API_ADMIN";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import "../styles.scss";
interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
  edit: Function;
}
function DataTable({
  data,
  count,
  setPage,
  setTake,
  pageSize,
  page,
  edit,
}: props) {
  const [isMobile, setIsMobile] = useState(false);
  const [deletePopconfim, dispatch] = useReducer(reducer, {
    open: false,
    id: -1,
  });
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.BANNER_DELETE + id);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Banner Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_banners"] });
    },
  });
  const mutationPositionUpdate = useMutation({
    mutationFn: (values: any) => {
      const obj = {
        position: Number(values?.position),
      };
      return PUT(API.BANNER_POSITION_UPDATE + values?.id, obj);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      dispatch({ type: "close" });
      Notifications["success"]({
        message: `Banner Position Successfully Updated`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_banners"] });
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderActions = (record: any) => (
    <div className="table-action">
      <Button type="text" size="small" onClick={() => edit(record)}>
        <TbEdit size={22} color="orange" />
      </Button>

      <Popconfirm
        title="Delete the task"
        description="Are you sure to delete this Banner?"
        okText="Yes"
        cancelText="No"
        placement="bottomLeft"
        onCancel={() => dispatch({ type: "close" })}
        open={deletePopconfim?.open && record?.id === deletePopconfim?.id}
        onConfirm={() => mutationDelete.mutate(record?.id)}
        okButtonProps={{ loading: mutationDelete.isPending }}
      >
        <Button
          type="text"
          size="small"
          onClick={() => dispatch({ type: "open", id: record?.id })}
        >
          <MdDeleteOutline size={22} color="red" />
        </Button>
      </Popconfirm>

      <Popover
        title="Change Order"
        placement="bottomLeft"
        trigger="click"
        content={
          <div>
            <Form
              initialValues={{ position: record?.position ?? 0 }}
              onFinish={(val: any) =>
                mutationPositionUpdate.mutate({
                  position: val?.position,
                  id: record?.id,
                })
              }
            >
              <Space.Compact>
                <Form.Item style={{ marginBottom: 5 }} name={"position"}>
                  <Input style={{ width: 110 }} />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={mutationPositionUpdate.isPending}
                >
                  Done
                </Button>
              </Space.Compact>
            </Form>
          </div>
        }
      >
        <Button type="text" size="small">
          <Badge size="small" count={record?.position}>
            <CgReorder size={22} />
          </Badge>
        </Button>
      </Popover>
    </div>
  );

  const columns = [
    {
      title: "Image",
      dataIndex: "img_desk",
      key: "img_desk",
      width: 50,
      render: (item: string) => (
        <div className="table-img">
          <Image
            style={{ height: 35, width: 35, objectFit: "cover" }}
            src={item}
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 500,
    },
    {
      title: "Desktop Size",
      dataIndex: "age",
      key: "age",
      width: 100,
      render: (text: any, record: any) => {
        return record?.img_desk ? (
          <Tag color="green">Available</Tag>
        ) : (
          <Tag color="red">Not Available</Tag>
        );
      },
    },
    {
      title: "Mobile Size",
      dataIndex: "age",
      key: "age",
      width: 100,
      render: (text: any, record: any) => {
        return record?.img_mob ? (
          <Tag color="green">Available</Tag>
        ) : (
          <Tag color="red">Not Available</Tag>
        );
      },
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (item: string) => <span>{`${moment(item).format("lll")}`}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 50,
      render: (item: boolean) => (
        <span>
          {item == true ? (
            <IoCheckmarkCircleOutline color="#008000" size={20} />
          ) : null}
        </span>
      ),
    },
    {
      title: "Action",
      width: 100,
      render: (item: any, record: any) => renderActions(record),
    },
  ];

  const renderMobileContent = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="banners-tableMobileEmpty">
          <TfiLayoutSliderAlt size={40} />
          <p>No Banners yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const id = record?.id ?? record?._id;
      return (
        <div className="banners-tableMobileCard" key={id}>
          <div className="banners-tableMobileHeader">
            <div className="banners-tableMobileImage">
              <Image
                src={record?.img_desk || record?.img_mob}
                alt={record?.title}
                width={70}
                height={50}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="banners-tableMobileTitle">
              <div className="title">{record?.title ?? "Untitled Banner"}</div>
              <div className="sub">
                {record?.createdAt
                  ? moment(record?.createdAt).format("MMM Do YYYY, h:mm A")
                  : "--"}
              </div>
            </div>
            {record?.status && (
              <IoCheckmarkCircleOutline color="#008000" size={20} />
            )}
          </div>
          <div className="banners-tableMobileBody">
            <div className="banners-tableMobileRow">
              <span className="label">Desktop</span>
              <span className="value">
                {record?.img_desk ? (
                  <Tag color="green">Available</Tag>
                ) : (
                  <Tag color="red">Not Available</Tag>
                )}
              </span>
            </div>
            <div className="banners-tableMobileRow">
              <span className="label">Mobile</span>
              <span className="value">
                {record?.img_mob ? (
                  <Tag color="green">Available</Tag>
                ) : (
                  <Tag color="red">Not Available</Tag>
                )}
              </span>
            </div>
            <div className="banners-tableMobileRow">
              <span className="label">Order</span>
              <span className="value">{record?.position ?? "-"}</span>
            </div>
          </div>
          <div className="banners-tableMobileActions">
            {renderActions(record)}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {contextHolder}
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record: any) => record?.id ?? record?._id}
          locale={{
            emptyText: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 0",
                  textAlign: "center",
                  gap: 8,
                }}
              >
                <TfiLayoutSliderAlt size={40} />
                <p>No Banners yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="banners-tableMobile">{renderMobileContent()}</div>
      )}
      <div className="table-pagination">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          showTotal={(total: any) => `Total ${count ?? 0} Banners`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
          total={count ?? 0}
          current={page}
        />
      </div>
    </>
  );
}

export default DataTable;
