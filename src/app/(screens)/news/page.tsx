"use client";
import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Input, Pagination, Empty, Spin, Button, Result } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import NewsCard from "./_components/newsCard";
import { FiRefreshCw } from "react-icons/fi";
import "./styles.scss";

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
  updatedAt?: string;
  author?: string;
  views?: number;
}

interface NewsResponse {
  data: NewsItem[];
  total?: number;
  page?: number;
  limit?: number;
}

export default function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 12;

  const {
    data: newsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      const response = await GET(API.NEWS_AND_BLOGS, {
        page: currentPage,
        limit: pageSize,
      });
      // Support both { data: [] } and [] shapes
      const data = Array.isArray((response as { data?: unknown })?.data)
        ? (response as { data: NewsItem[] }).data
        : Array.isArray(response)
          ? (response as NewsItem[])
          : [];
      // Try to get total from response, fallback to data.length
      const total = (response as { total?: number })?.total ?? data.length;
      return { data, total } as NewsResponse;
    },
    queryKey: ["news_list", currentPage],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  // Memoized filtered news for performance
  const filteredNews = useMemo(() => {
    if (!newsData?.data) return [];
    return newsData.data.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [newsData, searchTerm]);

  // Featured news: first item in filtered list
  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const otherNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="news-page">
      {/* Page Header */}
      <div className="news-page-header">
        <Container fluid>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="news-page-title">News & Updates</h1>
              <p className="news-page-subtitle">
                Stay updated with our latest news and announcements
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="news-container">
        {/* Search Bar */}
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Input.Search
              placeholder="Search news..."
              size="large"
              allowClear
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="news-search"
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            />
          </Col>
        </Row>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <div className="news-error-state">
            <Result
              status="warning"
              title="Unable to load news"
              subTitle={
                (error as Error)?.message ||
                "We're having trouble fetching the latest news. Please try again later."
              }
              extra={
                <Button
                  type="primary"
                  icon={<FiRefreshCw />}
                  onClick={() => refetch()}
                  loading={isFetching}
                  style={{ borderRadius: 8 }}
                >
                  Try Again
                </Button>
              }
            />
          </div>
        ) : filteredNews.length > 0 ? (
          <>
            {/* Featured News Section */}
            {featuredNews && (
              <Row className="mb-5">
                <Col lg={8} md={10} className="mx-auto">
                  <div
                    className="featured-news-card"
                    onClick={() =>
                      (window.location.href = `/news/${featuredNews.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {featuredNews.image || featuredNews.thumbnail ? (
                      <img
                        src={featuredNews.image || featuredNews.thumbnail}
                        alt={featuredNews.title}
                        className="featured-news-image"
                      />
                    ) : null}
                    <div className="featured-news-content">
                      <h2 className="featured-news-title">
                        {featuredNews.title}
                      </h2>
                      <p className="featured-news-description">
                        {featuredNews.description?.substring(0, 180)}
                        {featuredNews.description &&
                        featuredNews.description.length > 180
                          ? "..."
                          : ""}
                      </p>
                      <div className="featured-news-meta">
                        <span>{featuredNews.author}</span>
                        <span>
                          {new Date(
                            featuredNews.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {/* News Grid */}
            <Row className="g-4">
              {otherNews.map((news) => (
                <Col key={news.id} lg={4} md={6} sm={12}>
                  <NewsCard news={news} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {newsData?.total && newsData.total > pageSize && (
              <div className="news-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={newsData.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  style={{
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="No news found" />
        )}
      </Container>
    </div>
  );
}
