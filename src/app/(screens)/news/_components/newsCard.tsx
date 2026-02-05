import React from "react";
import { Card, Tag, Space } from "antd";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
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

  const handleClick = () => {
    router.push(`/news/${news.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="news-card"
      cover={
        mediaUrl ? (
          <div className="news-card-media">
            {isVideo ? (
              <>
                <video
                  src={news.video}
                  className="news-card-video"
                  poster={news.thumbnail}
                />
                <div className="news-card-video-overlay">
                  <PlayCircleOutlined style={{ fontSize: 48, color: "#fff" }} />
                </div>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt={news.title}
                className="news-card-image"
              />
            )}
          </div>
        ) : null
      }
    >
      <div className="news-card-content">
        {news.category && <Tag color="blue">{news.category}</Tag>}

        <h3 className="news-card-title">{news.title}</h3>

        <p className="news-card-description">
          {news.description?.substring(0, 100)}
          {news.description && news.description.length > 100 ? "..." : ""}
        </p>

        <Space className="news-card-meta" split="|">
          <Space size={4}>
            <CalendarOutlined />
            <span>{moment(news.createdAt).format("MMM DD, YYYY")}</span>
          </Space>

          {news.author && <span className="news-card-author">{news.author}</span>}

          {news.views !== undefined && (
            <Space size={4}>
              <EyeOutlined />
              <span>{news.views} views</span>
            </Space>
          )}
        </Space>
      </div>
    </Card>
  );
}
