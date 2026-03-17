"use client";
import Loading from "@/app/(dashboard)/_components/loading";
import API from "@/config/API";
import { DELETE, GET } from "@/util/apicall";
import { generateReviews, getRatingInfo } from "@/util/ratingUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, notification, Pagination, Popconfirm, Progress, Rate } from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaStar, FaRegUserCircle, FaCheckCircle } from "react-icons/fa";
import ReviewFormModal from "./reviewFormModal";
import { useRouter, useSearchParams } from "next/navigation";

interface ReviewItem {
  _id?: string;
  userName?: string;
  createdAt?: string;
  rating?: number | string;
  message?: string;
  isUserReview?: boolean;
  isGenerated?: boolean;
  [key: string]: unknown;
}

interface ProductData {
  pid?: string;
  review?: boolean;
  averageRating?: number | string;
  totalReviews?: number;
  [key: string]: unknown;
}

interface SessionData {
  token?: string;
  [key: string]: unknown;
}

type Props = {
  data: ProductData;
};

const RATING_LABELS: Record<number, string> = {
  5: "Excellent",
  4: "Very Good",
  3: "Good",
  2: "Fair",
  1: "Poor",
};

function RatingSummary({
  rating,
  totalReviews,
  allReviews,
}: {
  rating: number;
  totalReviews: number;
  allReviews: ReviewItem[];
}) {
  const breakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of allReviews) {
      const val = Math.round(Number(r.rating));
      if (val >= 1 && val <= 5) counts[val]++;
    }
    return counts;
  }, [allReviews]);

  return (
    <div className="review-summary">
      <div className="review-summary__score">
        <div className="review-summary__big-rating">{rating.toFixed(1)}</div>
        <Rate disabled allowHalf value={rating} style={{ fontSize: 16, color: "#f5a623" }} />
        <div className="review-summary__count">{totalReviews} ratings</div>
      </div>
      <div className="review-summary__bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const pct = totalReviews > 0 ? Math.round((breakdown[star] / totalReviews) * 100) : 0;
          return (
            <div key={star} className="review-summary__bar-row">
              <span className="review-summary__bar-label">
                <FaStar size={11} color="#f5a623" /> {star}
              </span>
              <Progress
                percent={pct}
                showInfo={false}
                strokeColor="#f5a623"
                trailColor="#f0f0f0"
                size="small"
                style={{ flex: 1, margin: "0 8px" }}
              />
              <span className="review-summary__bar-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({ item, onDelete }: { item: ReviewItem; onDelete?: () => void }) {
  const rating = Number(item.rating);
  const label = RATING_LABELS[Math.round(rating)] ?? "Good";
  const isGenerated = (item as any).isGenerated === true;
  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">
          <FaRegUserCircle size={32} color="#d1d5db" />
        </div>
        <div className="review-card__meta">
          <div className="review-card__name">{item.userName}</div>
          <div className="review-card__date-row">
            <span className="review-card__date">{moment(item.createdAt).format("MMM D, YYYY")}</span>
            {isGenerated && (
              <span className="review-card__verified">
                <FaCheckCircle size={11} color="#16a34a" />
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        {onDelete && (
          <Popconfirm title="Are you sure to delete this review?" onConfirm={onDelete}>
            <AiOutlineDelete color="#ef4444" size={18} style={{ cursor: "pointer", marginLeft: "auto" }} />
          </Popconfirm>
        )}
      </div>
      <div className="review-card__rating-row">
        <Rate disabled value={rating} style={{ fontSize: 13, color: "#f5a623" }} />
        <span className="review-card__label">{label}</span>
      </div>
      <p className="review-card__message">{item.message}</p>
    </div>
  );
}

function Reviews(props: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const session = sessionData as SessionData | null;
  const pid = props?.data?.pid || searchParams.get("pid") || "";
  const [Notifications, contextHolder] = notification.useNotification();
  const [formModal, setFormModal] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);

  const { data: reviews, isLoading: isReviewLoading } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.PRODUCT_REVIEW + "review", queryKey[1] as Record<string, unknown>),
    queryKey: ["product_review", { productId: pid, page, take, order: "DESC" }],
  });

  const deleteReview = useMutation({
    mutationFn: async (body: ReviewItem) => DELETE(API.PRODUCT_REVIEW + body?._id),
    onError: (error) => Notifications["error"]({ message: (error as Error).message }),
    onSuccess: () => {
      Notifications["success"]({ message: "Review Deleted Successfully" });
      router.refresh();
    },
  });

  const ratingInfo = useMemo(() => {
    const apiRating = props?.data?.averageRating;
    const apiReviews = props?.data?.totalReviews;
    if (apiRating) return { rating: Number(apiRating), reviews: Number(apiReviews ?? 0) };
    return getRatingInfo(pid);
  }, [pid, props?.data?.averageRating, props?.data?.totalReviews]);

  const generated = useMemo(
    () => generateReviews(pid, page, take),
    [pid, page, take],
  );

  const apiReviews: ReviewItem[] = Array.isArray(reviews?.data) ? reviews.data : [];
  const usingGenerated = apiReviews.length === 0;

  const displayReviews: ReviewItem[] = usingGenerated ? (generated.data as ReviewItem[]) : apiReviews;
  const totalReviews = usingGenerated
    ? generated.total
    : (reviews?.meta?.itemCount ?? 0);

  // Build summary from a sample of generated reviews for the bar chart
  const summaryReviews = useMemo(() => {
    if (!usingGenerated) return apiReviews;
    // Sample first 30 for the breakdown bars (enough to look realistic)
    return generateReviews(pid, 1, Math.min(30, generated.total)).data;
  }, [pid, usingGenerated, apiReviews]);

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setTake(ps);
  };

  return (
    <div className="reviews-section">
      {contextHolder}

      {isReviewLoading ? (
        <Loading />
      ) : (
        <>
          <RatingSummary
            rating={ratingInfo.rating}
            totalReviews={totalReviews}
            allReviews={summaryReviews}
          />

          <div className="reviews-section__header">
            <h6 className="reviews-section__title">Customer Reviews</h6>
            {session?.token && !props?.data?.review && (
              <Button size="small" onClick={() => setFormModal(true)}>
                Add Review +
              </Button>
            )}
          </div>

          <div className="reviews-list">
            {displayReviews.map((item, index) => (
              <ReviewCard
                key={item._id ?? index}
                item={item}
                onDelete={
                  item.isUserReview ? () => deleteReview.mutate(item) : undefined
                }
              />
            ))}
          </div>

          {totalReviews > take && (
            <Pagination
              total={totalReviews}
              current={page}
              pageSize={take}
              onChange={handlePageChange}
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}

      <ReviewFormModal
        visible={formModal}
        onClose={() => setFormModal(false)}
        pid={pid}
      />
    </div>
  );
}

export default Reviews;
