"use client";
import React from "react";
import { PlayCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import moment from "moment";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  content?: string;
  category?: string;
  createdAt: string;
  author?: string;
  views?: number;
}

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const router = useRouter();
  const isVideo = !!news.video;
  const mediaUrl = news.video || news.thumbnail || news.image;

  return (
    <div className="news-card" onClick={() => router.push(`/news/${news.id}`)}>
      {/* Media */}
      <div className="news-card-media">
        {isVideo ? (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={news.video}
              className="news-card-video"
              poster={news.thumbnail}
            />
            <div className="news-card-video-overlay">
              <PlayCircleOutlined style={{ fontSize: 48, color: "#fff" }} />
            </div>
          </>
        ) : mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt={news.title} className="news-card-image" />
        ) : (
          <div className="news-card-no-media">📰</div>
        )}

        {news.category && (
          <span className="news-card-category-badge">{news.category}</span>
        )}
      </div>

      {/* Body */}
      <div className="news-card-body">
        <h3 className="news-card-title">{news.title}</h3>

        <p className="news-card-description">
          {news.description?.substring(0, 110)}
          {news.description && news.description.length > 110 ? "…" : ""}
        </p>

        <div className="news-card-footer">
          <span className="news-card-meta-item">
            <CalendarOutlined />
            {moment(news.createdAt).format("MMM DD, YYYY")}
          </span>
          <span className="news-card-read-more">
            Read more&nbsp;→
          </span>
        </div>
      </div>
    </div>
  );
}
