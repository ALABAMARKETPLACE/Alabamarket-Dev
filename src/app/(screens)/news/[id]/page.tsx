"use client";
import React from "react";
import { Spin, Empty } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import moment from "moment";
import "../styles.scss";

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  content: string;
  category?: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  author?: string;
  views?: number;
  createdAt: string;
}

interface NewsResponse {
  data: NewsItem;
  status: boolean;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id;

  const { data: newsData, isLoading } = useQuery({
    queryFn: async () => {
      const response = await GET(API.NEWS_AND_BLOGS + newsId);
      return response as NewsResponse;
    },
    queryKey: ["news_detail", newsId],
  });

  const news = newsData?.data;
  const isVideo = !!news?.video;
  const mediaUrl = news?.video || news?.thumbnail || news?.image;

  if (isLoading) {
    return (
      <div className="news-detail-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <Empty description="Article not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      {/* Full-width hero media */}
      {mediaUrl && (
        <div className="news-detail-hero">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={news.video} poster={news.thumbnail} controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt={news.title} />
          )}
        </div>
      )}

      <div className="news-detail-container">
        {/* Back button */}
        <button className="news-detail-back" onClick={() => router.back()}>
          <ArrowLeftOutlined />
          Back to News
        </button>

        <div className="news-detail-card">
          <div className="news-detail-content">
            {/* Category */}
            {news.category && (
              <span className="news-detail-category">{news.category}</span>
            )}

            {/* Title */}
            <h1 className="news-detail-title">{news.title}</h1>

            {/* Meta */}
            <div className="news-detail-meta">
              <span className="news-detail-meta-item">
                <CalendarOutlined />
                {moment(news.createdAt).format("MMMM DD, YYYY")}
              </span>

              {news.author && (
                <span className="news-detail-meta-item">
                  <UserOutlined />
                  {news.author}
                </span>
              )}

              {news.views !== undefined && (
                <span className="news-detail-meta-item">
                  <EyeOutlined />
                  {news.views.toLocaleString()} views
                </span>
              )}
            </div>

            {/* Description */}
            <p className="news-detail-description">{news.description}</p>

            {/* Full content */}
            {news.content && (
              <div
                className="news-detail-body"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
