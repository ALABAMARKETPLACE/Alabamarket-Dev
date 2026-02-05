"use client";
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Card, Tag, Space, Spin, Button, Empty } from "antd";
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

  if (isLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return (
      <Container style={{ minHeight: "80vh" }}>
        <Empty description="News not found" />
      </Container>
    );
  }

  const mediaUrl = news.video || news.thumbnail || news.image;

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingTop: 20, paddingBottom: 40 }}>
      <Container>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 20 }}
        >
          Back
        </Button>

        <Card className="news-detail-card">
          <Row gutter={[24, 24]}>
            <Col lg={8} md={12} xs={24}>
              {mediaUrl && (
                <div style={{ marginBottom: 20 }}>
                  {isVideo ? (
                    <video
                      src={news.video}
                      poster={news.thumbnail}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt={news.title}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                      }}
                    />
                  )}
                </div>
              )}
            </Col>

            <Col lg={16} md={12} xs={24}>
              <div>
                {news.category && (
                  <Tag color="blue" style={{ marginBottom: 16 }}>
                    {news.category}
                  </Tag>
                )}

                <h1 style={{ fontSize: 32, marginBottom: 16 }}>
                  {news.title}
                </h1>

                <Space
                  className="news-detail-meta"
                  split="|"
                  style={{ marginBottom: 24, fontSize: 14, color: "#666" }}
                >
                  <Space size={4}>
                    <CalendarOutlined />
                    <span>{moment(news.createdAt).format("MMMM DD, YYYY")}</span>
                  </Space>

                  {news.author && (
                    <Space size={4}>
                      <UserOutlined />
                      <span>{news.author}</span>
                    </Space>
                  )}

                  {news.views !== undefined && (
                    <Space size={4}>
                      <EyeOutlined />
                      <span>{news.views} views</span>
                    </Space>
                  )}
                </Space>

                <div
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: "#333",
                    borderTop: "1px solid #eee",
                    paddingTop: 16,
                  }}
                >
                  <p>{news.description}</p>

                  {news.content && (
                    <div
                      style={{ whiteSpace: "pre-wrap", marginTop: 20 }}
                      dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
}
