"use client";
import Loading from "@/app/(dashboard)/_components/loading";
import API from "@/config/API";
import { DELETE, GET } from "@/util/apicall";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, notification, Pagination, Popconfirm, Rate } from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import ReviewFormModal from "./reviewFormModal";
import { useRouter, useSearchParams } from "next/navigation";

interface ReviewItem {
  _id?: string;
  userName?: string;
  createdAt?: string;
  rating?: number | string;
  message?: string;
  isUserReview?: boolean;
  [key: string]: unknown;
}

interface ProductData {
  pid?: string;
  review?: boolean;
  [key: string]: unknown;
}

interface SessionData {
  token?: string;
  [key: string]: unknown;
}

type Props = {
  data: ProductData;
};
function Reviews(props: Props) {
  //const
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const session = sessionData as SessionData | null;
  const pid = searchParams.get("pid");
  const [Notifications, contextHolder] = notification.useNotification();
  //state
  const [formModal, setFormModal] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);

  //function
  const { data: reviews, isLoading: isReviewLoading } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(
        API.PRODUCT_REVIEW + "review",
        queryKey[1] as Record<string, unknown>,
      ),
    queryKey: [
      "product_review",
      { productId: props?.data?.pid, page, take, order: "DESC" },
    ],
  });
  const deleteReview = useMutation({
    mutationFn: async (body: ReviewItem) => {
      return DELETE(API.PRODUCT_REVIEW + body?._id);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Review Deleted Successfully`,
      });
      router.refresh();
    },
  });
  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setTake(pageSize);
  };
  // Removed Back to Home button from here
  const handleBackToHome = undefined;
  return (
    <div>
      {contextHolder}
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div>Customer Reviews</div>
        {session?.token && !props?.data?.review ? (
          <Button onClick={() => setFormModal(true)}>Add Review +</Button>
        ) : null}
      </div>
      {isReviewLoading ? (
        <Loading />
      ) : reviews?.data?.length ? (
        reviews?.data?.map((item: ReviewItem, index: number) => (
          <React.Fragment key={index}>
            <div className="d-flex justify-content-start gap-3">
              <div> {item?.userName}</div>
              <div>{moment(item?.createdAt).format("ll")}</div>
              <Rate disabled allowHalf defaultValue={Number(item?.rating)} />
              <div> {item?.message}</div>

              {item?.isUserReview ? (
                <Popconfirm
                  title={"Are you sure to delete review?"}
                  onConfirm={() => deleteReview.mutate(item)}
                >
                  <AiOutlineDelete color="red" size={20} />
                </Popconfirm>
              ) : null}
            </div>
            <br />
          </React.Fragment>
        ))
      ) : (
        <div>No reviews available</div>
      )}
      <Pagination
        total={reviews?.meta?.itemCount}
        current={page}
        pageSize={take}
        onChange={handlePageChange}
      />
      <ReviewFormModal
        visible={formModal}
        onClose={() => setFormModal(false)}
        pid={pid}
      />
    </div>
  );
}

export default Reviews;
