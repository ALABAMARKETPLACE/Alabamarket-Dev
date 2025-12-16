"use client";
import { Avatar, List, notification, Popconfirm } from "antd";
import React, { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaStar } from "react-icons/fa6";
import { BsFillBookmarkFill } from "react-icons/bs";
import API from "@/config/API";
import { useRouter } from "next/navigation";
import { DELETE, GET } from "@/util/apicall";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import showPrice from "@/shared/helpers/showPrice";
import { MdError } from "react-icons/md";

const getVariantInfo = (data: any) => {
  let variantss = "";
  if (Array.isArray(data?.combination) == true) {
    data?.combination.map((item: any) => {
      variantss += `${item.value} `;
    });
  }
  return variantss.length ? `${variantss}` : variantss;
};
function WishListScreen() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const navigate = useRouter();
  const queryClient = useQueryClient();

  const {
    data: whishlist,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: async () =>
      await GET(API.WISHLIST_GETALL, {
        order: "DESC",
        page: page,
        take: pageSize,
      }),
    queryKey: ["wishlist_items", page],
    retry: 1,
  });

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.WISHLIST + id);
    },
    onError: (error, variables, context) => {
      notificationApi.error({ message: error?.message });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      notificationApi.success({ message: `Item removed from wishlist.` });
    },
  });

  const itemClick = (item: any) => {
    const url = new URLSearchParams({
      pid: item?.pid,
      ...(item?.variantId && { vid: item?.variantId }),
    });
    navigate.push(`/${item?.slug}?${url.toString()}`);
  };
  return (
    <>
      <div>
        {contextHolder}
        <div className="fs-5 fw-medium">{`My Wishlist (${
          whishlist?.meta?.itemCount ?? 0
        })`}</div>
        <hr />
        {isLoading ? (
          <div></div>
        ) : Array.isArray(whishlist?.data) && whishlist?.data.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={whishlist?.data}
            renderItem={(item: any, index) => (
              <List.Item
                className="favorite_list_item order-list-item"
                actions={[
                  <Popconfirm
                    placement="bottomRight"
                    title={"Are you sure to Remove item from wishlist?"}
                    okText="Yes"
                    cancelText="No"
                    onConfirm={async () => mutationDelete.mutate(item?.id)}
                  >
                    <a key="list-loadmore-edit" className="text-danger">
                      <span className="d-none d-md-flex">Delete</span>
                      <RiDeleteBinLine size={20} className="d-flex d-md-none" />
                    </a>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="d-flex flex-column h-100 align-items-center gap-1">
                      <Avatar
                        src={item?.image ?? ""}
                        shape="square"
                        size={80}
                        onClick={() => itemClick(item)}
                      />
                      {item?.status === false || item?.unit === 0 ? (
                        <span
                          className="mt-0 text-danger fw-medium"
                          style={{ fontSize: "14px" }}
                        >
                          Out of Stock
                        </span>
                      ) : null}
                    </div>
                  }
                  title={
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => itemClick(item)}
                    >
                      <span
                        style={{ textTransform: "capitalize" }}
                        className={"favorite_product_name"}
                      >
                        {item?.name ?? ""}
                        {getVariantInfo(item)}
                      </span>
                    </div>
                  }
                  description={
                    <div
                      onClick={() => itemClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      {true ? (
                        <div className="d-flex gap-2">
                          <div className="">
                            <FaStar color="#f5da42" /> &nbsp;
                            {isNaN(Number(item?.averageRating)) === false
                              ? Number(item?.averageRating)?.toFixed(1)
                              : 0}
                          </div>
                          <span className=" text-dark">
                            {item?.totalReviews
                              ? ` (${item?.totalReviews})`
                              : ""}
                          </span>
                        </div>
                      ) : null}
                      <h6 className="mt-0 text-dark fw-bold mt-2">
                        {showPrice(item?.price)}
                      </h6>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : isError ? (
          <div></div>
        ) : (
          <div className="text-center mt-5">
            <h3>No Favorites</h3>
            You have no items in your favourite
          </div>
        )}
      </div>
    </>
  );
}

export default WishListScreen;
